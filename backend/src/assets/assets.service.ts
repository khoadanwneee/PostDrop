import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgrestError, SupabaseClient, User } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import {
  AssetKind,
  storageFileName,
  validateAssetUpload,
} from './asset-policy';
import { CompleteAssetUploadDto } from './dto/complete-asset-upload.dto';
import { CreateLetterAttachmentDto } from './dto/create-letter-attachment.dto';
import { ListAssetsQueryDto } from './dto/list-assets-query.dto';
import { StartAssetUploadDto } from './dto/start-asset-upload.dto';
import { UpdateLetterAttachmentDto } from './dto/update-letter-attachment.dto';

const ASSET_COLUMNS = [
  'id',
  'owner_id',
  'source',
  'kind',
  'bucket_id',
  'object_path',
  'display_name',
  'category',
  'mime_type',
  'byte_size',
  'width',
  'height',
  'duration_ms',
  'status',
  'created_at',
  'updated_at',
].join(',');

const ATTACHMENT_COLUMNS = [
  'id',
  'letter_id',
  'asset_id',
  'client_id',
  'role',
  'x_percent',
  'y_percent',
  'scale',
  'rotation',
  'z_index',
  'alt_text',
  'created_at',
  'updated_at',
].join(',');

interface AssetRow {
  id: string;
  owner_id: string | null;
  source: 'built_in' | 'upload';
  kind: AssetKind;
  bucket_id: 'built-in-assets' | 'user-assets';
  object_path: string;
  display_name: string;
  category: string | null;
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  status: 'pending' | 'ready';
  created_at: string;
  updated_at: string;
}

interface AttachmentRow {
  id: string;
  letter_id: string;
  asset_id: string;
  client_id: string | null;
  role: 'decoration' | 'inline' | 'attachment';
  x_percent: number | null;
  y_percent: number | null;
  scale: number | null;
  rotation: number | null;
  z_index: number;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class AssetsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listBuiltIn(query: ListAssetsQueryDto) {
    const supabase = this.supabaseService.createPublicClient();
    let request = supabase
      .from('media_assets')
      .select(ASSET_COLUMNS)
      .eq('source', 'built_in')
      .eq('status', 'ready')
      .order('category')
      .order('display_name');

    if (query.kind) {
      request = request.eq('kind', query.kind);
    }
    if (query.category) {
      request = request.eq('category', query.category);
    }

    const { data, error } = await request;
    this.throwOnError(error);
    return Promise.all(
      (data as unknown as AssetRow[]).map((asset) =>
        this.toAssetResponse(supabase, asset),
      ),
    );
  }

  async listMine(supabase: SupabaseClient, query: ListAssetsQueryDto) {
    let request = supabase
      .from('media_assets')
      .select(ASSET_COLUMNS)
      .eq('source', 'upload')
      .order('created_at', { ascending: false });

    if (query.kind) {
      request = request.eq('kind', query.kind);
    }
    if (query.category) {
      request = request.eq('category', query.category);
    }

    const { data, error } = await request;
    this.throwOnError(error);
    return Promise.all(
      (data as unknown as AssetRow[]).map((asset) =>
        this.toAssetResponse(supabase, asset),
      ),
    );
  }

  async startUpload(
    supabase: SupabaseClient,
    user: User,
    dto: StartAssetUploadDto,
  ) {
    const validationError = validateAssetUpload(
      dto.kind,
      dto.mimeType,
      dto.byteSize,
    );
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    const id = randomUUID();
    const fileName = storageFileName(dto.fileName, dto.mimeType);
    const objectPath = `${user.id}/${id}/${fileName}`;
    const displayName = dto.displayName?.trim() || dto.fileName.trim();
    const input = {
      id,
      owner_id: user.id,
      source: 'upload',
      kind: dto.kind,
      bucket_id: 'user-assets',
      object_path: objectPath,
      display_name: displayName,
      category: dto.category?.trim() || null,
      mime_type: dto.mimeType,
      byte_size: dto.byteSize,
      status: 'pending',
    };

    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .insert(input)
      .select(ASSET_COLUMNS)
      .single();
    this.throwOnError(assetError);

    const { data: upload, error: uploadError } = await supabase.storage
      .from('user-assets')
      .createSignedUploadUrl(objectPath);

    if (uploadError) {
      await supabase.from('media_assets').delete().eq('id', id);
      throw new InternalServerErrorException('Unable to prepare the asset upload');
    }

    return {
      asset: await this.toAssetResponse(
        supabase,
        asset as unknown as AssetRow,
      ),
      upload: {
        bucket: 'user-assets',
        path: upload.path,
        token: upload.token,
        signedUrl: upload.signedUrl,
      },
    };
  }

  async completeUpload(
    supabase: SupabaseClient,
    id: string,
    dto: CompleteAssetUploadDto,
  ) {
    const asset = await this.findOwnedUpload(supabase, id);
    if (asset.status === 'ready') {
      return this.toAssetResponse(supabase, asset);
    }

    const pathParts = asset.object_path.split('/');
    const fileName = pathParts.pop() as string;
    const directory = pathParts.join('/');
    const { data: objects, error: storageError } = await supabase.storage
      .from(asset.bucket_id)
      .list(directory, { search: fileName, limit: 10 });

    if (storageError) {
      throw new InternalServerErrorException('Unable to verify the uploaded asset');
    }

    const object = objects.find((candidate) => candidate.name === fileName);
    if (!object) {
      throw new BadRequestException('Upload the file before completing the asset');
    }

    const actualMimeType = String(
      object.metadata?.mimetype ?? asset.mime_type,
    );
    const actualByteSize = Number(object.metadata?.size ?? asset.byte_size);
    const validationError = validateAssetUpload(
      asset.kind,
      actualMimeType,
      actualByteSize,
    );
    if (validationError) {
      await supabase.storage.from(asset.bucket_id).remove([asset.object_path]);
      throw new BadRequestException(validationError);
    }

    if (
      actualMimeType !== asset.mime_type ||
      actualByteSize !== Number(asset.byte_size)
    ) {
      await supabase.storage.from(asset.bucket_id).remove([asset.object_path]);
      throw new BadRequestException(
        'The uploaded file does not match the declared MIME type and size',
      );
    }

    const { data, error } = await supabase
      .rpc('complete_media_asset', {
        p_asset_id: id,
        p_width: dto.width,
        p_height: dto.height,
        p_duration_ms: dto.durationMs,
      })
      .select(ASSET_COLUMNS)
      .single();

    if (error?.code === 'P0002') {
      throw new NotFoundException('Pending asset not found');
    }
    this.throwOnError(error);
    return this.toAssetResponse(supabase, data as unknown as AssetRow);
  }

  async removeAsset(supabase: SupabaseClient, id: string): Promise<void> {
    const asset = await this.findOwnedUpload(supabase, id);
    const { data: attachment } = await supabase
      .from('letter_attachments')
      .select('id')
      .eq('asset_id', id)
      .limit(1)
      .maybeSingle();

    if (attachment) {
      throw new ConflictException('Remove the asset from its letters first');
    }

    const { error: storageError } = await supabase.storage
      .from(asset.bucket_id)
      .remove([asset.object_path]);
    if (storageError) {
      throw new InternalServerErrorException('Unable to remove the stored asset');
    }

    const { error } = await supabase.from('media_assets').delete().eq('id', id);
    this.throwOnError(error);
  }

  async listLetterAttachments(supabase: SupabaseClient, letterId: string) {
    await this.assertOwnLetter(supabase, letterId);
    const { data, error } = await supabase
      .from('letter_attachments')
      .select(ATTACHMENT_COLUMNS)
      .eq('letter_id', letterId)
      .order('z_index')
      .order('created_at');
    this.throwOnError(error);

    return Promise.all(
      (data as unknown as AttachmentRow[]).map((attachment) =>
        this.hydrateAttachment(supabase, attachment),
      ),
    );
  }

  async createLetterAttachment(
    supabase: SupabaseClient,
    letterId: string,
    dto: CreateLetterAttachmentDto,
  ) {
    await this.assertDraft(supabase, letterId);
    this.validatePlacement(dto);
    await this.findReadyAsset(supabase, dto.assetId);

    const { data, error } = await supabase
      .from('letter_attachments')
      .insert(this.toAttachmentInput(letterId, dto))
      .select(ATTACHMENT_COLUMNS)
      .single();
    this.throwOnError(error);
    return this.hydrateAttachment(supabase, data as unknown as AttachmentRow);
  }

  async updateLetterAttachment(
    supabase: SupabaseClient,
    letterId: string,
    attachmentId: string,
    dto: UpdateLetterAttachmentDto,
  ) {
    await this.assertDraft(supabase, letterId);
    const current = await this.findAttachment(
      supabase,
      letterId,
      attachmentId,
    );
    this.validatePlacement({ ...this.toPlacement(current), ...dto });

    const { data, error } = await supabase
      .from('letter_attachments')
      .update(this.toAttachmentUpdate(dto))
      .eq('id', attachmentId)
      .eq('letter_id', letterId)
      .select(ATTACHMENT_COLUMNS)
      .single();
    this.throwOnError(error);
    return this.hydrateAttachment(supabase, data as unknown as AttachmentRow);
  }

  async removeLetterAttachment(
    supabase: SupabaseClient,
    letterId: string,
    attachmentId: string,
  ): Promise<void> {
    await this.assertDraft(supabase, letterId);
    await this.findAttachment(supabase, letterId, attachmentId);
    const { error } = await supabase
      .from('letter_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('letter_id', letterId);
    this.throwOnError(error);
  }

  private async hydrateAttachment(
    supabase: SupabaseClient,
    attachment: AttachmentRow,
  ) {
    const asset = await this.findReadyAsset(supabase, attachment.asset_id);
    return {
      id: attachment.id,
      letterId: attachment.letter_id,
      assetId: attachment.asset_id,
      clientId: attachment.client_id ?? undefined,
      role: attachment.role,
      x: attachment.x_percent === null ? undefined : Number(attachment.x_percent),
      y: attachment.y_percent === null ? undefined : Number(attachment.y_percent),
      scale: attachment.scale === null ? undefined : Number(attachment.scale),
      rotation:
        attachment.rotation === null ? undefined : Number(attachment.rotation),
      zIndex: attachment.z_index,
      altText: attachment.alt_text ?? undefined,
      asset: await this.toAssetResponse(supabase, asset),
      createdAt: attachment.created_at,
      updatedAt: attachment.updated_at,
    };
  }

  private toAttachmentInput(
    letterId: string,
    dto: CreateLetterAttachmentDto,
  ) {
    return {
      letter_id: letterId,
      asset_id: dto.assetId,
      client_id: dto.clientId,
      role: dto.role,
      x_percent: dto.x,
      y_percent: dto.y,
      scale: dto.scale,
      rotation: dto.rotation,
      z_index: dto.zIndex,
      alt_text: dto.altText,
    };
  }

  private toAttachmentUpdate(dto: UpdateLetterAttachmentDto) {
    return {
      client_id: dto.clientId,
      role: dto.role,
      x_percent: dto.x,
      y_percent: dto.y,
      scale: dto.scale,
      rotation: dto.rotation,
      z_index: dto.zIndex,
      alt_text: dto.altText,
    };
  }

  private toPlacement(row: AttachmentRow): CreateLetterAttachmentDto {
    return {
      assetId: row.asset_id,
      clientId: row.client_id ?? undefined,
      role: row.role,
      x: row.x_percent ?? undefined,
      y: row.y_percent ?? undefined,
      scale: row.scale ?? undefined,
      rotation: row.rotation ?? undefined,
      zIndex: row.z_index,
      altText: row.alt_text ?? undefined,
    };
  }

  private validatePlacement(
    dto: Pick<
      CreateLetterAttachmentDto,
      'role' | 'x' | 'y' | 'scale' | 'rotation'
    >,
  ) {
    if (
      dto.role === 'decoration' &&
      [dto.x, dto.y, dto.scale, dto.rotation].some(
        (value) => value === undefined,
      )
    ) {
      throw new BadRequestException(
        'Decoration attachments require x, y, scale, and rotation',
      );
    }
  }

  private async assertOwnLetter(supabase: SupabaseClient, letterId: string) {
    const { data, error } = await supabase
      .from('letters')
      .select('id,content_status')
      .eq('id', letterId)
      .maybeSingle();
    this.throwOnError(error);
    if (!data) {
      throw new NotFoundException('Letter not found');
    }
    return data as { id: string; content_status: string };
  }

  private async assertDraft(supabase: SupabaseClient, letterId: string) {
    const letter = await this.assertOwnLetter(supabase, letterId);
    if (letter.content_status !== 'draft') {
      throw new ConflictException('Attachments on a sealed letter cannot change');
    }
  }

  private async findOwnedUpload(
    supabase: SupabaseClient,
    id: string,
  ): Promise<AssetRow> {
    const { data, error } = await supabase
      .from('media_assets')
      .select(ASSET_COLUMNS)
      .eq('id', id)
      .eq('source', 'upload')
      .maybeSingle();
    this.throwOnError(error);
    if (!data) {
      throw new NotFoundException('Asset not found');
    }
    return data as unknown as AssetRow;
  }

  private async findReadyAsset(
    supabase: SupabaseClient,
    id: string,
  ): Promise<AssetRow> {
    const { data, error } = await supabase
      .from('media_assets')
      .select(ASSET_COLUMNS)
      .eq('id', id)
      .eq('status', 'ready')
      .maybeSingle();
    this.throwOnError(error);
    if (!data) {
      throw new NotFoundException('Ready asset not found');
    }
    return data as unknown as AssetRow;
  }

  private async findAttachment(
    supabase: SupabaseClient,
    letterId: string,
    attachmentId: string,
  ): Promise<AttachmentRow> {
    const { data, error } = await supabase
      .from('letter_attachments')
      .select(ATTACHMENT_COLUMNS)
      .eq('id', attachmentId)
      .eq('letter_id', letterId)
      .maybeSingle();
    this.throwOnError(error);
    if (!data) {
      throw new NotFoundException('Letter attachment not found');
    }
    return data as unknown as AttachmentRow;
  }

  private async toAssetResponse(
    supabase: SupabaseClient,
    asset: AssetRow,
  ): Promise<Record<string, unknown>> {
    let url: string | undefined;
    let urlExpiresIn: number | undefined;

    if (asset.status === 'ready' && asset.source === 'built_in') {
      url = supabase.storage
        .from(asset.bucket_id)
        .getPublicUrl(asset.object_path).data.publicUrl;
    } else if (asset.status === 'ready') {
      const expiresIn = 60 * 60;
      const { data, error } = await supabase.storage
        .from(asset.bucket_id)
        .createSignedUrl(asset.object_path, expiresIn);
      if (error) {
        throw new InternalServerErrorException('Unable to sign the asset URL');
      }
      url = data.signedUrl;
      urlExpiresIn = expiresIn;
    }

    return {
      id: asset.id,
      source: asset.source,
      kind: asset.kind,
      displayName: asset.display_name,
      category: asset.category ?? undefined,
      mimeType: asset.mime_type,
      byteSize: Number(asset.byte_size),
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
      durationMs: asset.duration_ms ?? undefined,
      status: asset.status,
      url,
      urlExpiresIn,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    };
  }

  private throwOnError(error: PostgrestError | null): void {
    if (!error) {
      return;
    }
    if (error.code === '23505') {
      throw new ConflictException('The asset or attachment already exists');
    }
    if (
      ['22007', '22P02', '23502', '23503', '23514', '42501'].includes(
        error.code,
      )
    ) {
      throw new BadRequestException(error.message);
    }
    throw new InternalServerErrorException({
      message: 'Supabase request failed',
      code: error.code,
    });
  }
}
