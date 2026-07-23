import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { EncryptionService } from '../encryption/encryption.service';
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
  'letter_type',
  'paper',
  'font',
  'envelope',
  'note',
  'status',
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
  delivery_method: 'email' | 'physical' | 'hybrid';
  letter_type: 'online' | 'handwritten';
  paper: string;
  font: string;
  envelope: string;
  note: string | null;
  status: 'draft' | 'scheduled' | 'processing' | 'delivered' | 'failed';
  sealed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LetterWithSecretRow extends LetterRow {
  encrypted_content: string | null;
}

@Injectable()
export class LettersService {
  constructor(private readonly encryptionService: EncryptionService) {}

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
        stored: letters.filter((letter) => letter.status === 'scheduled').length,
        upcoming: letters.filter((letter) =>
          ['scheduled', 'processing'].includes(letter.status),
        ).length,
        confirmation: 0,
        delivered: letters.filter((letter) => letter.status === 'delivered').length,
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
    if (current.status !== 'draft') {
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
    if (current.status !== 'draft') {
      throw new ConflictException('A sealed letter cannot be deleted');
    }

    const { error } = await supabase.from('letters').delete().eq('id', id);
    this.throwOnError(error);
  }

  async seal(supabase: SupabaseClient, id: string) {
    const current = await this.findSecretRow(supabase, id);
    if (current.status !== 'draft') {
      throw new ConflictException('The letter has already been sealed');
    }

    this.validateForSealing(current);
    const encrypted = this.encryptionService.encrypt(current.content as string);

    const { data, error } = await supabase
      .rpc('seal_letter', {
        p_letter_id: id,
        p_encrypted_content: encrypted.ciphertext,
        p_content_iv: encrypted.iv,
        p_content_auth_tag: encrypted.authTag,
        p_encryption_version: encrypted.version,
      })
      .select(PUBLIC_LETTER_COLUMNS)
      .single();

    if (error?.code === 'P0002') {
      throw new NotFoundException('Letter not found');
    }
    if (error?.code === 'P0001') {
      throw new ConflictException(error.message);
    }
    if (error?.code === '23514' || error?.code === '22007') {
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
    if (!letter.content || letter.content.trim().length < 10) {
      throw new BadRequestException('The content must contain at least 10 characters');
    }
    if (letter.recipient_name.trim().length < 2 || !letter.recipient_email) {
      throw new BadRequestException('Recipient information is incomplete');
    }
    if (!letter.delivery_at || new Date(letter.delivery_at).getTime() <= Date.now()) {
      throw new BadRequestException('Delivery time must be in the future');
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
      delivery_at: dto.deliveryDate,
      delivery_timezone: dto.deliveryTimezone,
      delivery_method: dto.deliveryMethod,
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
      ...(row.status === 'draft' ? { content: row.content ?? '' } : {}),
      recipientName: row.recipient_name,
      recipientEmail: row.recipient_email,
      recipientPhone: row.recipient_phone ?? undefined,
      address: row.address ?? undefined,
      deliveryDate: row.delivery_at,
      deliveryTimezone: row.delivery_timezone,
      deliveryMethod: row.delivery_method,
      letterType: row.letter_type,
      paper: row.paper,
      font: row.font,
      envelope: row.envelope,
      note: row.note ?? undefined,
      status: row.status,
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
