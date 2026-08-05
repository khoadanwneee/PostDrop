import { BadRequestException, ConflictException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AssetsService } from './assets.service';

// A minimal, queue-based fake of the Supabase query builder: each
// `${table}:${terminalMethod}` key holds an ordered queue of `{ data, error }`
// responses consumed one per call, in the order the service issues them.
function createSupabaseMock(responses: Record<string, unknown[]>) {
  const cursors: Record<string, number> = {};
  const nextResponse = (key: string) => {
    const queue = responses[key] ?? [];
    const index = cursors[key] ?? 0;
    cursors[key] = index + 1;
    return queue[index] ?? { data: null, error: null };
  };

  const from = jest.fn((table: string) => {
    const chain: Record<string, unknown> = {
      select: jest.fn(() => chain),
      insert: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      neq: jest.fn(() => chain),
      order: jest.fn(() => chain),
      maybeSingle: jest.fn(async () => nextResponse(`${table}:maybeSingle`)),
      single: jest.fn(async () => nextResponse(`${table}:single`)),
    };
    return chain;
  });

  const storage = {
    from: jest.fn(() => ({
      createSignedUrl: jest.fn(async () => ({
        data: { signedUrl: 'https://storage.example/signed' },
        error: null,
      })),
    })),
  };

  return { from, storage } as unknown as SupabaseClient;
}

describe('AssetsService — future_video attachment rules', () => {
  const service = new AssetsService(undefined as never);
  const letterId = '11111111-1111-4111-8111-111111111111';
  const assetId = '22222222-2222-4222-8222-222222222222';
  const attachmentId = '33333333-3333-4333-8333-333333333333';

  const draftLetterRow = { data: { id: letterId, content_status: 'draft' }, error: null };
  const videoAssetRow = {
    data: {
      id: assetId,
      owner_id: 'owner-1',
      source: 'upload',
      kind: 'video',
      bucket_id: 'user-assets',
      object_path: 'owner-1/asset/video.webm',
      display_name: 'video.webm',
      category: null,
      mime_type: 'video/webm',
      byte_size: 1024,
      width: null,
      height: null,
      duration_ms: 4000,
      status: 'ready',
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    },
    error: null,
  };
  const imageAssetRow = { ...videoAssetRow, data: { ...videoAssetRow.data, kind: 'image', mime_type: 'image/png' } };
  const insertedAttachmentRow = {
    data: {
      id: attachmentId,
      letter_id: letterId,
      asset_id: assetId,
      client_id: null,
      role: 'future_video',
      x_percent: null,
      y_percent: null,
      scale: null,
      rotation: null,
      z_index: 0,
      alt_text: null,
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    },
    error: null,
  };

  it('accepts a future_video attachment referencing a ready video asset with no existing one on the letter', async () => {
    const supabase = createSupabaseMock({
      'letters:maybeSingle': [draftLetterRow],
      // findReadyAsset is called twice: once during validation, once while hydrating the response.
      'media_assets:maybeSingle': [videoAssetRow, videoAssetRow],
      'letter_attachments:maybeSingle': [{ data: null, error: null }],
      'letter_attachments:single': [insertedAttachmentRow],
    });

    const result = await service.createLetterAttachment(supabase, letterId, {
      assetId,
      role: 'future_video',
    });

    expect(result.role).toBe('future_video');
  });

  it('rejects a future_video attachment that references a non-video asset', async () => {
    const supabase = createSupabaseMock({
      'letters:maybeSingle': [draftLetterRow],
      'media_assets:maybeSingle': [imageAssetRow],
    });

    await expect(
      service.createLetterAttachment(supabase, letterId, {
        assetId,
        role: 'future_video',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a second future_video attachment on the same letter', async () => {
    const supabase = createSupabaseMock({
      'letters:maybeSingle': [draftLetterRow],
      'media_assets:maybeSingle': [videoAssetRow],
      'letter_attachments:maybeSingle': [
        { data: { id: 'existing-future-video-attachment' }, error: null },
      ],
    });

    await expect(
      service.createLetterAttachment(supabase, letterId, {
        assetId,
        role: 'future_video',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
