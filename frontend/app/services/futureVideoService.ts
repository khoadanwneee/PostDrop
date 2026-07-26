import type { FutureVideoData, UploadedVideo } from '../types/future-video';

/**
 * Generates a secure, unique storage path for future videos.
 * Format: future-videos/{userId}/{letterId}/{timestamp}-{randomId}.{extension}
 */
export function generateStoragePath(
  userId: string,
  letterId: string,
  extension: string,
): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '') || 'anonymous';
  const safeLetterId = letterId.replace(/[^a-zA-Z0-9_-]/g, '') || 'draft';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const ext = extension.replace(/^\./, '') || 'webm';
  return `future-videos/${safeUserId}/${safeLetterId}/${timestamp}-${randomId}.${ext}`;
}

/**
 * Derives file extension from MIME type.
 */
export function getExtensionFromMimeType(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('quicktime') || mimeType.includes('mov')) return 'mov';
  return 'webm';
}

/**
 * Service to handle uploading future videos to storage backend (or in-memory Blob URL).
 */
export async function uploadFutureVideo(
  file: Blob | File,
  userId = 'user_guest',
  letterId = 'letter_draft',
  durationSeconds?: number,
): Promise<UploadedVideo> {
  // Validate non-empty file
  if (!file || file.size === 0) {
    throw new Error('Tệp video không hợp lệ hoặc có dung lượng 0 byte.');
  }

  const mimeType = file.type || 'video/webm';
  const ext = getExtensionFromMimeType(mimeType);
  const storagePath = generateStoragePath(userId, letterId, ext);
  const id = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fileName =
    file instanceof File
      ? file.name
      : `recorded-video-${Date.now()}.${ext}`;

  // Read Object URL for preview without persisting to localStorage / sessionStorage
  const objectUrl = URL.createObjectURL(file);

  const result: UploadedVideo = {
    id,
    url: objectUrl,
    storagePath,
    fileName,
    mimeType,
    size: file.size,
    duration: durationSeconds,
    createdAt: new Date().toISOString(),
  };

  return result;
}

/**
 * Constructs metadata binding letter and video for future unlocking.
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
