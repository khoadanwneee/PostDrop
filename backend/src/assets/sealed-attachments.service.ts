import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'crypto';
import {
  EncryptionService,
  WrappedDataKey,
} from '../encryption/encryption.service';
import { SupabaseService } from '../supabase/supabase.service';

const SEALED_BUCKET = 'sealed-attachments';

interface AttachmentSourceRow {
  id: string;
  asset_id: string;
}

interface AssetSourceRow {
  id: string;
  bucket_id: string;
  object_path: string;
  mime_type: string;
  byte_size: number;
  status: 'pending' | 'ready';
}

export interface SealedAttachmentManifestItem {
  id: string;
  letter_attachment_id: string;
  source_asset_id: string;
  bucket_id: typeof SEALED_BUCKET;
  object_path: string;
  original_mime_type: string;
  original_byte_size: number;
  encrypted_byte_size: number;
  plaintext_sha256: string;
  ciphertext_sha256: string;
  content_iv: string;
  content_auth_tag: string;
  encryption_version: number;
}

export interface PreparedSealedAttachments {
  manifest: SealedAttachmentManifestItem[];
  uploadedPaths: string[];
}

interface SealedAttachmentRow {
  id: string;
  letter_id: string;
  bucket_id: typeof SEALED_BUCKET;
  object_path: string;
  original_mime_type: string;
  original_byte_size: number;
  encrypted_byte_size: number;
  plaintext_sha256: string;
  ciphertext_sha256: string;
  content_iv: string;
  content_auth_tag: string;
  encryption_version: number;
}

interface EnvelopeLetterRow {
  encrypted_data_key: string | null;
  data_key_iv: string | null;
  data_key_auth_tag: string | null;
  master_key_version: number | null;
}

export interface DecryptedSealedAttachment {
  id: string;
  letterId: string;
  mimeType: string;
  byteSize: number;
  data: Buffer;
}

@Injectable()
export class SealedAttachmentsService {
  private readonly logger = new Logger(SealedAttachmentsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async prepareForSeal(
    userSupabase: SupabaseClient,
    letterId: string,
    dataKey: Buffer,
  ): Promise<PreparedSealedAttachments> {
    const { data: attachmentData, error: attachmentError } = await userSupabase
      .from('letter_attachments')
      .select('id,asset_id')
      .eq('letter_id', letterId)
      .order('created_at');
    this.throwOnDatabaseError(attachmentError);

    const attachments = (attachmentData ?? []) as AttachmentSourceRow[];
    if (attachments.length === 0) {
      return { manifest: [], uploadedPaths: [] };
    }

    const assetIds = [...new Set(attachments.map((row) => row.asset_id))];
    const { data: assetData, error: assetError } = await userSupabase
      .from('media_assets')
      .select('id,bucket_id,object_path,mime_type,byte_size,status')
      .in('id', assetIds);
    this.throwOnDatabaseError(assetError);

    const assets = new Map(
      ((assetData ?? []) as AssetSourceRow[]).map((asset) => [asset.id, asset]),
    );
    const serviceSupabase = this.supabaseService.createServiceClient();
    const manifest: SealedAttachmentManifestItem[] = [];
    const uploadedPaths: string[] = [];

    try {
      for (const attachment of attachments) {
        const asset = assets.get(attachment.asset_id);
        if (!asset || asset.status !== 'ready') {
          throw new BadRequestException(
            `Attachment ${attachment.id} does not reference a ready asset`,
          );
        }

        const { data: sourceObject, error: downloadError } =
          await serviceSupabase.storage
            .from(asset.bucket_id)
            .download(asset.object_path);
        if (downloadError || !sourceObject) {
          throw new BadRequestException(
            `Attachment ${attachment.id} is missing from Storage`,
          );
        }

        const plaintext = Buffer.from(await sourceObject.arrayBuffer());
        if (plaintext.byteLength !== Number(asset.byte_size)) {
          throw new BadRequestException(
            `Attachment ${attachment.id} no longer matches its catalog size`,
          );
        }

        const encrypted = this.encryptionService.encryptAttachment(
          plaintext,
          dataKey,
        );
        const sealedId = randomUUID();
        const objectPath = `${letterId}/${sealedId}.bin`;
        const { error: uploadError } = await serviceSupabase.storage
          .from(SEALED_BUCKET)
          .upload(objectPath, encrypted.ciphertext, {
            contentType: 'application/octet-stream',
            upsert: false,
          });
        if (uploadError) {
          throw new InternalServerErrorException(
            `Unable to preserve attachment ${attachment.id}`,
          );
        }
        uploadedPaths.push(objectPath);

        manifest.push({
          id: sealedId,
          letter_attachment_id: attachment.id,
          source_asset_id: asset.id,
          bucket_id: SEALED_BUCKET,
          object_path: objectPath,
          original_mime_type: asset.mime_type,
          original_byte_size: plaintext.byteLength,
          encrypted_byte_size: encrypted.ciphertext.byteLength,
          plaintext_sha256: this.sha256(plaintext),
          ciphertext_sha256: this.sha256(encrypted.ciphertext),
          content_iv: encrypted.iv,
          content_auth_tag: encrypted.authTag,
          encryption_version: encrypted.version,
        });
      }
    } catch (error) {
      await this.cleanupStaged(uploadedPaths);
      throw error;
    }

    return { manifest, uploadedPaths };
  }

  async cleanupStaged(paths: string[]): Promise<void> {
    if (paths.length === 0) {
      return;
    }

    const serviceSupabase = this.supabaseService.createServiceClient();
    const { error } = await serviceSupabase.storage
      .from(SEALED_BUCKET)
      .remove(paths);
    if (error) {
      // A reconciliation job must remove any orphan left by a failed seal.
      this.logger.error(
        `Unable to clean ${paths.length} staged sealed attachment(s): ${error.message}`,
      );
    }
  }

  async decryptSealedAttachment(
    sealedAttachmentId: string,
    expectedLetterId?: string,
  ): Promise<DecryptedSealedAttachment> {
    const serviceSupabase = this.supabaseService.createServiceClient();
    const { data: sealedData, error: sealedError } = await serviceSupabase
      .from('sealed_letter_attachments')
      .select(
        [
          'id',
          'letter_id',
          'bucket_id',
          'object_path',
          'original_mime_type',
          'original_byte_size',
          'encrypted_byte_size',
          'plaintext_sha256',
          'ciphertext_sha256',
          'content_iv',
          'content_auth_tag',
          'encryption_version',
        ].join(','),
      )
      .eq('id', sealedAttachmentId)
      .maybeSingle();
    this.throwOnDatabaseError(sealedError);
    if (!sealedData) {
      throw new NotFoundException('Sealed attachment not found');
    }
    const sealed = sealedData as unknown as SealedAttachmentRow;
    if (expectedLetterId && sealed.letter_id !== expectedLetterId) {
      throw new NotFoundException('Sealed attachment not found');
    }

    if (
      sealed.encryption_version !==
      EncryptionService.ENVELOPE_ENCRYPTION_VERSION
    ) {
      throw new InternalServerErrorException(
        `Unsupported attachment encryption version: ${sealed.encryption_version}`,
      );
    }

    const { data: letterData, error: letterError } = await serviceSupabase
      .from('letters')
      .select(
        'encrypted_data_key,data_key_iv,data_key_auth_tag,master_key_version',
      )
      .eq('id', sealed.letter_id)
      .maybeSingle();
    this.throwOnDatabaseError(letterError);
    if (!letterData) {
      throw new NotFoundException('Sealed attachment letter not found');
    }
    const letter = letterData as EnvelopeLetterRow;
    const wrapped = this.toWrappedDataKey(letter);

    const { data: storedObject, error: downloadError } =
      await serviceSupabase.storage
        .from(sealed.bucket_id)
        .download(sealed.object_path);
    if (downloadError || !storedObject) {
      throw new InternalServerErrorException('Sealed attachment object is missing');
    }

    const ciphertext = Buffer.from(await storedObject.arrayBuffer());
    if (
      ciphertext.byteLength !== Number(sealed.encrypted_byte_size) ||
      this.sha256(ciphertext) !== sealed.ciphertext_sha256
    ) {
      throw new InternalServerErrorException(
        'Sealed attachment ciphertext failed its integrity check',
      );
    }

    let plaintext: Buffer;
    try {
      const dataKey = this.encryptionService.unwrapDataKey(wrapped);
      plaintext = this.encryptionService.decryptAttachment(
        ciphertext,
        sealed.content_iv,
        sealed.content_auth_tag,
        dataKey,
      );
    } catch {
      throw new InternalServerErrorException(
        'Unable to decrypt the sealed attachment',
      );
    }

    if (
      plaintext.byteLength !== Number(sealed.original_byte_size) ||
      this.sha256(plaintext) !== sealed.plaintext_sha256
    ) {
      throw new InternalServerErrorException(
        'Sealed attachment plaintext failed its integrity check',
      );
    }

    return {
      id: sealed.id,
      letterId: sealed.letter_id,
      mimeType: sealed.original_mime_type,
      byteSize: plaintext.byteLength,
      data: plaintext,
    };
  }

  private toWrappedDataKey(letter: EnvelopeLetterRow): WrappedDataKey {
    if (
      !letter.encrypted_data_key ||
      !letter.data_key_iv ||
      !letter.data_key_auth_tag ||
      letter.master_key_version === null
    ) {
      throw new InternalServerErrorException(
        'The letter has no envelope-encryption key',
      );
    }

    return {
      encryptedDataKey: letter.encrypted_data_key,
      iv: letter.data_key_iv,
      authTag: letter.data_key_auth_tag,
      keyVersion: Number(letter.master_key_version),
    };
  }

  private sha256(value: Buffer): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private throwOnDatabaseError(error: PostgrestError | null): void {
    if (!error) {
      return;
    }
    throw new InternalServerErrorException({
      message: 'Supabase request failed',
      code: error.code,
    });
  }
}
