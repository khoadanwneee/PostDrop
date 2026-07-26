import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { EncryptionService } from '../encryption/encryption.service';
import { SupabaseService } from '../supabase/supabase.service';
import { SealedAttachmentsService } from './sealed-attachments.service';

describe('SealedAttachmentsService', () => {
  const letterId = '11111111-1111-4111-8111-111111111111';
  const attachmentId = '22222222-2222-4222-8222-222222222222';
  const assetId = '33333333-3333-4333-8333-333333333333';
  const source = Buffer.from('private attachment bytes');
  const storedObjects = new Map<string, Buffer>();
  const encryption = new EncryptionService({
    getOrThrow: jest
      .fn()
      .mockReturnValue(Buffer.alloc(32, 9).toString('base64')),
  } as unknown as ConfigService);
  let sealedRow: Record<string, unknown> | undefined;
  let letterRow: Record<string, unknown> | undefined;
  const blobOf = (value: Buffer) => new Blob([Uint8Array.from(value)]);

  const serviceClient = {
    storage: {
      from: jest.fn((bucket: string) => ({
        download: jest.fn(async (path: string) => {
          if (bucket === 'source-bucket' && path === 'owner/source.png') {
            return { data: blobOf(source), error: null };
          }
          const value = storedObjects.get(`${bucket}/${path}`);
          return value
            ? { data: blobOf(value), error: null }
            : { data: null, error: { message: 'not found' } };
        }),
        upload: jest.fn(async (path: string, value: Buffer) => {
          storedObjects.set(`${bucket}/${path}`, Buffer.from(value));
          return { data: { path }, error: null };
        }),
        remove: jest.fn(async (paths: string[]) => {
          paths.forEach((path) => storedObjects.delete(`${bucket}/${path}`));
          return { data: paths, error: null };
        }),
      })),
    },
    from: jest.fn((table: string) => {
      const row =
        table === 'sealed_letter_attachments' ? sealedRow : letterRow;
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(async () => ({ data: row, error: null })),
          })),
        })),
      };
    }),
  };
  const supabaseService = {
    createServiceClient: jest.fn(() => serviceClient),
  } as unknown as SupabaseService;
  const service = new SealedAttachmentsService(supabaseService, encryption);

  beforeEach(() => {
    storedObjects.clear();
    sealedRow = undefined;
    letterRow = undefined;
    jest.clearAllMocks();
  });

  it('snapshots, encrypts, verifies, and decrypts an attachment', async () => {
    const userClient = {
      from: jest.fn((table: string) => {
        if (table === 'letter_attachments') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(async () => ({
                  data: [{ id: attachmentId, asset_id: assetId }],
                  error: null,
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => ({
            in: jest.fn(async () => ({
              data: [
                {
                  id: assetId,
                  bucket_id: 'source-bucket',
                  object_path: 'owner/source.png',
                  mime_type: 'image/png',
                  byte_size: source.byteLength,
                  status: 'ready',
                },
              ],
              error: null,
            })),
          })),
        };
      }),
    } as unknown as SupabaseClient;
    const dataKey = encryption.generateDataKey();
    const prepared = await service.prepareForSeal(
      userClient,
      letterId,
      dataKey,
    );
    const manifest = prepared.manifest[0];
    const wrapped = encryption.wrapDataKey(dataKey);

    expect(prepared.manifest).toHaveLength(1);
    expect(manifest.letter_attachment_id).toBe(attachmentId);
    expect(manifest.plaintext_sha256).toHaveLength(64);
    expect(
      storedObjects.get(`sealed-attachments/${manifest.object_path}`),
    ).not.toEqual(source);

    sealedRow = {
      ...manifest,
      letter_id: letterId,
    };
    letterRow = {
      encrypted_data_key: wrapped.encryptedDataKey,
      data_key_iv: wrapped.iv,
      data_key_auth_tag: wrapped.authTag,
      master_key_version: wrapped.keyVersion,
    };

    const decrypted = await service.decryptSealedAttachment(manifest.id);

    expect(decrypted.mimeType).toBe('image/png');
    expect(decrypted.data).toEqual(source);
  });
});
