import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { SealedAttachmentsService } from '../assets/sealed-attachments.service';
import {
  EncryptionService,
  WrappedDataKey,
} from '../encryption/encryption.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RevealTokenService } from './reveal-token.service';

interface ExchangeRow {
  session_id: string;
  session_expires_at: string;
  renderer_version: number;
}

interface RevealLetterRow {
  id: string;
  delivery_method: 'digital' | 'physical';
  content_status: 'draft' | 'sealed';
  available_at: string | null;
  renderer_version: number | null;
  sealed_presentation: Record<string, unknown> | null;
  encrypted_content: string | null;
  content_iv: string | null;
  content_auth_tag: string | null;
  encryption_version: number | null;
  encrypted_data_key: string | null;
  data_key_iv: string | null;
  data_key_auth_tag: string | null;
  master_key_version: number | null;
}

interface SealedAttachmentRow {
  id: string;
  letter_attachment_id: string;
  original_mime_type: string;
  original_byte_size: number;
}

interface AttachmentPlacementRow {
  id: string;
  role: 'decoration' | 'inline' | 'attachment';
  x_percent: number | null;
  y_percent: number | null;
  scale: number | null;
  rotation: number | null;
  z_index: number;
  alt_text: string | null;
}

@Injectable()
export class RevealService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly tokenService: RevealTokenService,
    private readonly encryptionService: EncryptionService,
    private readonly sealedAttachmentsService: SealedAttachmentsService,
  ) {}

  async exchange(letterId: string, capabilityToken: string) {
    const sessionToken = this.tokenService.createSessionToken();
    const sessionExpiresAt = this.tokenService.sessionExpiresAt();
    const supabase = this.supabaseService.createServiceClient();
    const { data, error } = await supabase.rpc('exchange_reveal_capability', {
      p_letter_id: letterId,
      p_capability_hash: this.tokenService.hash(capabilityToken),
      p_session_hash: this.tokenService.hash(sessionToken),
      p_session_expires_at: sessionExpiresAt,
    });

    if (error?.code === '22007') {
      throw new ForbiddenException('The letter is not available yet');
    }
    if (error) {
      throw new UnauthorizedException('Reveal capability is invalid or expired');
    }

    const row = data?.[0] as ExchangeRow | undefined;
    if (!row) {
      throw new InternalServerErrorException(
        'Reveal session exchange returned no data',
      );
    }

    return {
      letterId,
      sessionToken,
      expiresAt: row.session_expires_at,
      rendererVersion: Number(row.renderer_version),
    };
  }

  async revealContent(letterId: string, authorization: string | undefined) {
    const sessionToken = this.bearerToken(authorization);
    await this.authorize(letterId, sessionToken, 'content_revealed');

    const supabase = this.supabaseService.createServiceClient();
    const { data, error } = await supabase
      .from('letters')
      .select(
        [
          'id',
          'delivery_method',
          'content_status',
          'available_at',
          'renderer_version',
          'sealed_presentation',
          'encrypted_content',
          'content_iv',
          'content_auth_tag',
          'encryption_version',
          'encrypted_data_key',
          'data_key_iv',
          'data_key_auth_tag',
          'master_key_version',
        ].join(','),
      )
      .eq('id', letterId)
      .maybeSingle();
    this.throwOnDatabaseError(error);
    if (!data) {
      throw new NotFoundException('Letter not found');
    }

    const letter = data as unknown as RevealLetterRow;
    const content = this.decryptContent(letter);
    const attachments = await this.listAttachments(letterId);

    return {
      letterId,
      rendererVersion: Number(letter.renderer_version),
      presentation: {
        ...(letter.sealed_presentation ?? {}),
        content,
        attachments,
      },
    };
  }

  async revealAttachment(
    letterId: string,
    attachmentId: string,
    authorization: string | undefined,
  ) {
    const sessionToken = this.bearerToken(authorization);
    await this.authorize(letterId, sessionToken, 'attachment_accessed');
    return this.sealedAttachmentsService.decryptSealedAttachment(
      attachmentId,
      letterId,
    );
  }

  private async authorize(
    letterId: string,
    sessionToken: string,
    eventType: 'content_revealed' | 'attachment_accessed',
  ): Promise<void> {
    const supabase = this.supabaseService.createServiceClient();
    const { error } = await supabase.rpc('authorize_reveal_session', {
      p_letter_id: letterId,
      p_session_hash: this.tokenService.hash(sessionToken),
      p_event_type: eventType,
    });
    if (error) {
      throw new UnauthorizedException('Reveal session is invalid or expired');
    }
  }

  private async listAttachments(letterId: string) {
    const supabase = this.supabaseService.createServiceClient();
    const { data: sealedData, error: sealedError } = await supabase
      .from('sealed_letter_attachments')
      .select(
        'id,letter_attachment_id,original_mime_type,original_byte_size',
      )
      .eq('letter_id', letterId)
      .order('created_at');
    this.throwOnDatabaseError(sealedError);
    const sealed = (sealedData ?? []) as unknown as SealedAttachmentRow[];
    if (sealed.length === 0) {
      return [];
    }

    const { data: placementData, error: placementError } = await supabase
      .from('letter_attachments')
      .select('id,role,x_percent,y_percent,scale,rotation,z_index,alt_text')
      .in(
        'id',
        sealed.map((item) => item.letter_attachment_id),
      );
    this.throwOnDatabaseError(placementError);
    const placements = new Map(
      ((placementData ?? []) as unknown as AttachmentPlacementRow[]).map(
        (placement) => [placement.id, placement],
      ),
    );

    return sealed.map((item) => {
      const placement = placements.get(item.letter_attachment_id);
      if (!placement) {
        throw new InternalServerErrorException(
          'Sealed attachment placement is missing',
        );
      }
      return {
        id: item.id,
        role: placement.role,
        mimeType: item.original_mime_type,
        byteSize: Number(item.original_byte_size),
        x: placement.x_percent === null ? undefined : Number(placement.x_percent),
        y: placement.y_percent === null ? undefined : Number(placement.y_percent),
        scale: placement.scale === null ? undefined : Number(placement.scale),
        rotation:
          placement.rotation === null ? undefined : Number(placement.rotation),
        zIndex: placement.z_index,
        altText: placement.alt_text ?? undefined,
        contentPath: `/api/reveal/${letterId}/attachments/${item.id}`,
      };
    });
  }

  private decryptContent(letter: RevealLetterRow): string {
    if (
      letter.delivery_method !== 'digital' ||
      letter.content_status !== 'sealed' ||
      !letter.available_at ||
      !letter.renderer_version ||
      !letter.sealed_presentation ||
      !letter.encrypted_content ||
      !letter.content_iv ||
      !letter.content_auth_tag ||
      letter.encryption_version !==
        EncryptionService.ENVELOPE_ENCRYPTION_VERSION
    ) {
      throw new InternalServerErrorException(
        'Letter reveal data is incomplete or unsupported',
      );
    }

    try {
      const dataKey = this.encryptionService.unwrapDataKey(
        this.wrappedDataKey(letter),
      );
      return this.encryptionService.decryptTextWithDataKey(
        {
          ciphertext: letter.encrypted_content,
          iv: letter.content_iv,
          authTag: letter.content_auth_tag,
        },
        dataKey,
      );
    } catch {
      throw new InternalServerErrorException('Unable to decrypt the letter');
    }
  }

  private wrappedDataKey(letter: RevealLetterRow): WrappedDataKey {
    if (
      !letter.encrypted_data_key ||
      !letter.data_key_iv ||
      !letter.data_key_auth_tag ||
      letter.master_key_version === null
    ) {
      throw new InternalServerErrorException(
        'Letter envelope-encryption key is missing',
      );
    }
    return {
      encryptedDataKey: letter.encrypted_data_key,
      iv: letter.data_key_iv,
      authTag: letter.data_key_auth_tag,
      keyVersion: Number(letter.master_key_version),
    };
  }

  private bearerToken(authorization: string | undefined): string {
    const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{32,256})$/);
    if (!match) {
      throw new UnauthorizedException('A reveal session bearer token is required');
    }
    return match[1];
  }

  private throwOnDatabaseError(error: PostgrestError | null): void {
    if (!error) {
      return;
    }
    throw new InternalServerErrorException({
      message: 'Reveal database request failed',
      code: error.code,
    });
  }
}
