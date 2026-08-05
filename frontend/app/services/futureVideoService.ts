import { apiFetch, readErrorMessage } from '../lib/api-client';
import type { FutureVideoData, UploadedVideo } from '../types/future-video';

/**
 * Derives file extension from MIME type.
 */
export function getExtensionFromMimeType(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('quicktime') || mimeType.includes('mov')) return 'mov';
  return 'webm';
}

interface StartUploadResponse {
  asset: { id: string };
  upload: { signedUrl: string };
}

interface AssetResponse {
  id: string;
  url?: string;
}

interface AttachmentResponse {
  id: string;
  createdAt: string;
}

/**
 * Uploads the compose-time "future video" to the real backend: a presigned
 * Supabase Storage upload (POST /api/assets/uploads -> PUT signed URL ->
 * POST /api/assets/:id/complete), then attaches the ready asset to the
 * letter as a `future_video` attachment (POST /api/letters/:id/attachments).
 * This attachment rides the existing seal/reveal pipeline unchanged, so the
 * video only becomes fetchable once the letter is revealed.
 */
export async function uploadFutureVideo(
  file: Blob | File,
  letterId: string,
  durationSeconds?: number,
): Promise<UploadedVideo> {
  if (!file || file.size === 0) {
    throw new Error('Tệp video không hợp lệ hoặc có dung lượng 0 byte.');
  }
  if (!letterId) {
    throw new Error('Chưa chuẩn bị xong bản nháp lá thư. Vui lòng thử lại.');
  }

  // Strip codec parameters (e.g. "video/webm;codecs=vp8,opus") — the backend
  // only recognizes the bare MIME type.
  const mimeType = (file.type || 'video/webm').split(';')[0];
  const ext = getExtensionFromMimeType(mimeType);
  const fileName =
    file instanceof File ? file.name : `future-video-${Date.now()}.${ext}`;

  const startResponse = await apiFetch('/api/assets/uploads', {
    method: 'POST',
    body: JSON.stringify({
      kind: 'video',
      mimeType,
      byteSize: file.size,
      fileName,
    }),
  });
  if (!startResponse.ok) {
    throw new Error(
      await readErrorMessage(startResponse, 'Không thể chuẩn bị tải video lên.'),
    );
  }
  const { asset, upload } = (await startResponse.json()) as StartUploadResponse;

  const putResponse = await fetch(upload.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType, 'x-upsert': 'false' },
    body: file,
  });
  if (!putResponse.ok) {
    throw new Error('Tải video lên bộ nhớ lưu trữ thất bại. Vui lòng thử lại.');
  }

  const completeResponse = await apiFetch(`/api/assets/${asset.id}/complete`, {
    method: 'POST',
    body: JSON.stringify({
      durationMs:
        durationSeconds !== undefined
          ? Math.round(durationSeconds * 1000)
          : undefined,
    }),
  });
  if (!completeResponse.ok) {
    throw new Error(
      await readErrorMessage(
        completeResponse,
        'Không thể hoàn tất tải video lên.',
      ),
    );
  }
  const readyAsset = (await completeResponse.json()) as AssetResponse;

  const attachResponse = await apiFetch(`/api/letters/${letterId}/attachments`, {
    method: 'POST',
    body: JSON.stringify({ assetId: readyAsset.id, role: 'future_video' }),
  });
  if (!attachResponse.ok) {
    throw new Error(
      await readErrorMessage(
        attachResponse,
        'Không thể đính kèm video vào lá thư.',
      ),
    );
  }
  const attachment = (await attachResponse.json()) as AttachmentResponse;

  return {
    id: attachment.id,
    url: readyAsset.url ?? '',
    storagePath: readyAsset.id,
    fileName,
    mimeType,
    size: file.size,
    duration: durationSeconds,
    createdAt: attachment.createdAt,
  };
}

/**
 * Constructs metadata binding letter and video for future unlocking.
 * Kept for callers that still want a client-side summary of the bound
 * video; the durable record now lives server-side as a `letter_attachments`
 * row (see `uploadFutureVideo`).
 */
export function bindVideoToLetter(
  video: UploadedVideo,
  userId: string,
  letterId: string,
  unlockAtDate: string,
): FutureVideoData {
  return {
    videoId: video.id,
    letterId,
    userId,
    videoUrl: video.url,
    storagePath: video.storagePath,
    recordedAt: video.createdAt,
    unlockAt: unlockAtDate,
    status: 'locked',
  };
}

/**
 * Safely revokes an Object URL to prevent memory leaks.
 */
export function revokeVideoObjectUrl(url: string | null | undefined): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore invalid URL errors
    }
  }
}
