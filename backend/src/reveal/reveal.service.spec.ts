import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { SealedAttachmentsService } from '../assets/sealed-attachments.service';
import { EncryptionService } from '../encryption/encryption.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RevealService } from './reveal.service';
import { RevealTokenService } from './reveal-token.service';

describe('RevealService', () => {
  const letterId = '22222222-2222-4222-8222-222222222222';
  const encryption = new EncryptionService(
    new ConfigService({
      LETTER_ENCRYPTION_KEY: Buffer.alloc(32, 3).toString('base64'),
    }),
  );
  const tokens = new RevealTokenService(
    new ConfigService({
      REVEAL_TOKEN_SECRET: Buffer.alloc(32, 4).toString('base64'),
      PUBLIC_APP_URL: 'https://postdrop.example',
    }),
  );
  const sealedAttachments = {
    decryptSealedAttachment: jest.fn(),
  } as unknown as SealedAttachmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exchanges only a capability hash for a hashed short-lived session', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          session_id: '33333333-3333-4333-8333-333333333333',
          session_expires_at: '2026-07-29T00:30:00.000Z',
          renderer_version: 1,
        },
      ],
      error: null,
    });
    const supabase = {
      createServiceClient: () => ({ rpc }),
    } as unknown as SupabaseService;
    const service = new RevealService(
      supabase,
      tokens,
      encryption,
      sealedAttachments,
    );
    const capability = tokens.capabilityToken(letterId);

    const result = await service.exchange(letterId, capability);

    expect(result.sessionToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(rpc).toHaveBeenCalledWith('exchange_reveal_capability', {
      p_letter_id: letterId,
      p_capability_hash: tokens.hash(capability),
      p_session_hash: tokens.hash(result.sessionToken),
      p_session_expires_at: expect.any(String),
    });
    expect(JSON.stringify(rpc.mock.calls)).not.toContain(capability);
  });

  it('authorizes and decrypts the immutable presentation', async () => {
    const dataKey = encryption.generateDataKey();
    const encrypted = encryption.encryptTextWithDataKey(
      'Private future letter',
      dataKey,
    );
    const wrapped = encryption.wrapDataKey(dataKey);
    const rpc = jest.fn().mockResolvedValue({ data: 'session-id', error: null });
    const letterQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: letterId,
          delivery_method: 'digital',
          content_status: 'sealed',
          available_at: '2026-07-29T00:00:00.000Z',
          renderer_version: 1,
          sealed_presentation: {
            title: 'Future letter',
            paper: 'Ivory',
          },
          encrypted_content: encrypted.ciphertext,
          content_iv: encrypted.iv,
          content_auth_tag: encrypted.authTag,
          encryption_version: encrypted.version,
          encrypted_data_key: wrapped.encryptedDataKey,
          data_key_iv: wrapped.iv,
          data_key_auth_tag: wrapped.authTag,
          master_key_version: wrapped.keyVersion,
        },
        error: null,
      }),
    };
    const attachmentId = '44444444-4444-4444-8444-444444444444';
    const sealedQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: attachmentId,
            letter_attachment_id: attachmentId,
            original_mime_type: 'video/webm',
            original_byte_size: 4096,
          },
        ],
        error: null,
      }),
    };
    const placementQuery = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: [
          {
            id: attachmentId,
            client_id: 'future-video',
            role: 'future_video',
            x_percent: null,
            y_percent: null,
            scale: null,
            rotation: null,
            z_index: 0,
            alt_text: null,
          },
        ],
        error: null,
      }),
    };
    const client = {
      rpc,
      from: jest.fn((table: string) => {
        if (table === 'letters') return letterQuery;
        if (table === 'sealed_letter_attachments') return sealedQuery;
        return placementQuery;
      }),
    };
    const supabase = {
      createServiceClient: () => client,
    } as unknown as SupabaseService;
    const service = new RevealService(
      supabase,
      tokens,
      encryption,
      sealedAttachments,
    );
    const sessionToken = 'session-token-value-12345678901234567890';

    await expect(
      service.revealContent(letterId, `Bearer ${sessionToken}`),
    ).resolves.toEqual({
      letterId,
      rendererVersion: 1,
      presentation: {
        title: 'Future letter',
        paper: 'Ivory',
        content: 'Private future letter',
        attachments: [
          {
            id: attachmentId,
            clientId: 'future-video',
            role: 'future_video',
            mimeType: 'video/webm',
            byteSize: 4096,
            x: undefined,
            y: undefined,
            scale: undefined,
            rotation: undefined,
            zIndex: 0,
            altText: undefined,
            contentPath: `/api/reveal/${letterId}/attachments/${attachmentId}`,
          },
        ],
      },
    });
    expect(rpc).toHaveBeenCalledWith('authorize_reveal_session', {
      p_letter_id: letterId,
      p_session_hash: tokens.hash(sessionToken),
      p_event_type: 'content_revealed',
    });
  });

  it('rejects content access without a reveal-session bearer token', async () => {
    const supabase = {
      createServiceClient: jest.fn(),
    } as unknown as SupabaseService;
    const service = new RevealService(
      supabase,
      tokens,
      encryption,
      sealedAttachments,
    );

    await expect(service.revealContent(letterId, undefined)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(supabase.createServiceClient).not.toHaveBeenCalled();
  });
});
