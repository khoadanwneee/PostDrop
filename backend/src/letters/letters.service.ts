import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { SealedAttachmentsService } from '../assets/sealed-attachments.service';
import { EncryptionService } from '../encryption/encryption.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';

const PUBLIC_LETTER_COLUMNS = [
  'id',
  'title',
  'content',
  'recipient_name',
  'recipient_email',
  'recipient_phone',
  'address',
  'delivery_at',
  'delivery_timezone',
  'delivery_method',
  'physical_fulfillment_mode',
  'letter_type',
  'paper',
  'font',
  'envelope',
  'note',
  'content_status',
  'sealed_at',
  'created_at',
  'updated_at',
].join(',');

interface LetterRow {
  id: string;
  title: string;
  content: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  address: string | null;
  delivery_at: string | null;
  delivery_timezone: string;
  delivery_method: 'digital' | 'physical';
  physical_fulfillment_mode: 'print_design' | 'stored_original' | null;
  letter_type: 'online' | 'handwritten';
  paper: string;
  font: string;
  envelope: string;
  note: string | null;
  content_status: 'draft' | 'sealed';
  sealed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LetterWithSecretRow extends LetterRow {
  encrypted_content: string | null;
}

@Injectable()
export class LettersService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly sealedAttachmentsService: SealedAttachmentsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async findAll(supabase: SupabaseClient) {
    const { data, error } = await supabase
      .from('letters')
      .select(PUBLIC_LETTER_COLUMNS)
      .order('updated_at', { ascending: false });

    this.throwOnError(error);
    return (data as unknown as LetterRow[]).map((row) => this.toResponse(row));
  }

  async dashboard(supabase: SupabaseClient) {
    const letters = await this.findAll(supabase);
    return {
      summary: {
        stored: letters.filter((letter) => letter.contentStatus === 'sealed').length,
        upcoming: letters.filter(
          (letter) =>
            letter.contentStatus === 'sealed' &&
            letter.expectedArrivalAt !== null &&
            new Date(letter.expectedArrivalAt).getTime() > Date.now(),
        ).length,
        confirmation: 0,
        delivered: 0,
      },
      letters,
    };
  }

  async findOne(supabase: SupabaseClient, id: string) {
    const row = await this.findRow(supabase, id);
    return this.toResponse(row);
  }

  async create(supabase: SupabaseClient, dto: CreateLetterDto) {
    const { data, error } = await supabase
      .from('letters')
      .insert(this.toDatabaseInput(dto))
      .select(PUBLIC_LETTER_COLUMNS)
      .single();

    this.throwOnError(error);
    return this.toResponse(data as unknown as LetterRow);
  }

  async update(supabase: SupabaseClient, id: string, dto: UpdateLetterDto) {
    const current = await this.findRow(supabase, id);
    if (current.content_status !== 'draft') {
      throw new ConflictException('A sealed letter cannot be edited');
    }

    const { data, error } = await supabase
      .from('letters')
      .update(this.toDatabaseInput(dto))
      .eq('id', id)
      .select(PUBLIC_LETTER_COLUMNS)
      .maybeSingle();

    this.throwOnError(error);
    if (!data) {
      throw new ConflictException('The letter could not be updated');
    }

    return this.toResponse(data as unknown as LetterRow);
  }

  async remove(supabase: SupabaseClient, id: string): Promise<void> {
    const current = await this.findRow(supabase, id);
    if (current.content_status !== 'draft') {
      throw new ConflictException('A sealed letter cannot be deleted');
    }

    const { error } = await supabase.from('letters').delete().eq('id', id);
    this.throwOnError(error);
  }

  async seal(supabase: SupabaseClient, ownerId: string, id: string) {
    const current = await this.findSecretRow(supabase, id);
    if (current.content_status !== 'draft') {
      throw new ConflictException('The letter has already been sealed');
    }

    this.validateForSealing(current);
    if (
      current.delivery_method === 'physical' &&
      current.physical_fulfillment_mode === 'stored_original'
    ) {
      return this.sealStoredOriginal(ownerId, id);
    }

    const dataKey = this.encryptionService.generateDataKey();
    const encrypted = this.encryptionService.encryptTextWithDataKey(
      current.content as string,
      dataKey,
    );
    const wrappedKey = this.encryptionService.wrapDataKey(dataKey);
    const prepared = await this.sealedAttachmentsService.prepareForSeal(
      supabase,
      id,
      dataKey,
    );

    const serviceSupabase = this.supabaseService.createServiceClient();
    const { data, error } = await serviceSupabase
      .rpc('seal_letter_with_attachments', {
        p_owner_id: ownerId,
        p_letter_id: id,
        p_encrypted_content: encrypted.ciphertext,
        p_content_iv: encrypted.iv,
        p_content_auth_tag: encrypted.authTag,
        p_encryption_version: encrypted.version,
        p_encrypted_data_key: wrappedKey.encryptedDataKey,
        p_data_key_iv: wrappedKey.iv,
        p_data_key_auth_tag: wrappedKey.authTag,
        p_master_key_version: wrappedKey.keyVersion,
        p_sealed_attachments: prepared.manifest,
      })
      .select(PUBLIC_LETTER_COLUMNS)
      .single();

    if (error) {
      // A PostgreSQL error means the transaction rolled back, so the staged
      // objects are safe to remove. For an ambiguous transport failure, keep
      // ciphertext and let reconciliation decide whether the RPC committed.
      if (error.code) {
        await this.sealedAttachmentsService.cleanupStaged(
          prepared.uploadedPaths,
        );
      }
      if (error?.code === 'P0002') {
        throw new NotFoundException('Letter not found');
      }
      if (error?.code === 'P0001') {
        throw new ConflictException(error.message);
      }
      if (
        error?.code === '23514' ||
        error?.code === '22007' ||
        error?.code === '22P02'
      ) {
        throw new BadRequestException(error.message);
      }
      this.throwOnError(error);
    }

    return this.toResponse(data as unknown as LetterRow);
  }

  private async sealStoredOriginal(ownerId: string, id: string) {
    const serviceSupabase = this.supabaseService.createServiceClient();
    const { data, error } = await serviceSupabase
      .rpc('seal_stored_original_letter', {
        p_owner_id: ownerId,
        p_letter_id: id,
      })
      .select(PUBLIC_LETTER_COLUMNS)
      .single();

    if (error?.code === 'P0002') {
      throw new NotFoundException('Letter not found');
    }
    if (error?.code === 'P0001') {
      throw new ConflictException(error.message);
    }
    if (
      error?.code === '23514' ||
      error?.code === '22007' ||
      error?.code === '22P02'
    ) {
      throw new BadRequestException(error.message);
    }
    this.throwOnError(error);

    return this.toResponse(data as unknown as LetterRow);
  }

  private async findRow(supabase: SupabaseClient, id: string): Promise<LetterRow> {
    const { data, error } = await supabase
      .from('letters')
      .select(PUBLIC_LETTER_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    this.throwOnError(error);
    if (!data) {
      throw new NotFoundException('Letter not found');
    }

    return data as unknown as LetterRow;
  }

  private async findSecretRow(
    supabase: SupabaseClient,
    id: string,
  ): Promise<LetterWithSecretRow> {
    const { data, error } = await supabase
      .from('letters')
      .select(`${PUBLIC_LETTER_COLUMNS},encrypted_content`)
      .eq('id', id)
      .maybeSingle();

    this.throwOnError(error);
    if (!data) {
      throw new NotFoundException('Letter not found');
    }

    return data as unknown as LetterWithSecretRow;
  }

  private validateForSealing(letter: LetterWithSecretRow) {
    if (letter.title.trim().length < 2) {
      throw new BadRequestException('The title must contain at least 2 characters');
    }
    const isStoredOriginal =
      letter.delivery_method === 'physical' &&
      letter.physical_fulfillment_mode === 'stored_original';
    if (
      !isStoredOriginal &&
      (!letter.content || letter.content.trim().length < 10)
    ) {
      throw new BadRequestException('The content must contain at least 10 characters');
    }
    if (isStoredOriginal && letter.content?.trim()) {
      throw new BadRequestException(
        'Stored-original contents must not be entered as digital letter content',
      );
    }
    if (letter.recipient_name.trim().length < 2) {
      throw new BadRequestException('Recipient information is incomplete');
    }
    if (letter.delivery_method === 'digital' && !letter.recipient_email) {
      throw new BadRequestException(
        'A recipient email is required for digital delivery',
      );
    }
    if (
      letter.delivery_method === 'physical' &&
      (!letter.physical_fulfillment_mode || !letter.address?.trim())
    ) {
      throw new BadRequestException(
        'A fulfillment mode and address are required for physical delivery',
      );
    }
    if (!letter.delivery_at || new Date(letter.delivery_at).getTime() <= Date.now()) {
      throw new BadRequestException('Expected arrival time must be in the future');
    }
  }

  private toDatabaseInput(dto: CreateLetterDto | UpdateLetterDto) {
    return {
      title: dto.title,
      content: dto.content,
      recipient_name: dto.recipientName,
      recipient_email: dto.recipientEmail,
      recipient_phone: dto.recipientPhone,
      address: dto.address,
      delivery_at: dto.expectedArrivalAt,
      delivery_timezone: dto.deliveryTimezone,
      delivery_method: dto.deliveryMethod,
      physical_fulfillment_mode:
        dto.deliveryMethod === 'digital' ? null : dto.physicalFulfillmentMode,
      letter_type: dto.letterType,
      paper: dto.paper,
      font: dto.font,
      envelope: dto.envelope,
      note: dto.note,
    };
  }

  private toResponse(row: LetterRow) {
    return {
      id: row.id,
      title: row.title,
      ...(row.content_status === 'draft' ? { content: row.content ?? '' } : {}),
      recipientName: row.recipient_name,
      recipientEmail: row.recipient_email,
      recipientPhone: row.recipient_phone ?? undefined,
      address: row.address ?? undefined,
      expectedArrivalAt: row.delivery_at,
      deliveryTimezone: row.delivery_timezone,
      deliveryMethod: row.delivery_method,
      physicalFulfillmentMode: row.physical_fulfillment_mode ?? undefined,
      letterType: row.letter_type,
      paper: row.paper,
      font: row.font,
      envelope: row.envelope,
      note: row.note ?? undefined,
      contentStatus: row.content_status,
      sealedAt: row.sealed_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private throwOnError(error: PostgrestError | null): void {
    if (!error) {
      return;
    }

    if (error.code === '23514' || error.code === '22007' || error.code === '22P02') {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException({
      message: 'Supabase request failed',
      code: error.code,
    });
  }
}
