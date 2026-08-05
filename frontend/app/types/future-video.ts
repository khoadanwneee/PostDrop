export type CameraState =
  | 'idle'
  | 'requesting-permission'
  | 'camera-ready'
  | 'recording'
  | 'recorded'
  | 'uploading'
  | 'completed'
  | 'error';

export interface UploadedVideo {
  id: string;
  url: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  size: number;
  duration?: number;
  createdAt: string;
}

export interface FutureVideoData {
  videoId: string;
  letterId: string;
  userId: string;
  videoUrl: string;
  storagePath: string;
  recordedAt: string;
  unlockAt: string;
  status: 'locked' | 'available';
}

export interface CameraErrorDetails {
  type:
    | 'permission-denied'
    | 'not-found'
    | 'in-use'
    | 'unsupported'
    | 'insecure-context'
    | 'unknown';
  message: string;
}

export interface VideoConfig {
  maxDurationSeconds: number;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
}

export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
  maxDurationSeconds: 180, // 3 minutes
  // Matches the backend's video asset ceiling (MAX_ASSET_BYTES in
  // backend/src/assets/asset-policy.ts and the Storage bucket's
  // file_size_limit) — keep these in sync.
  maxSizeBytes: 50 * 1024 * 1024, // 50 MB
  allowedMimeTypes: [
    'video/webm',
    'video/mp4',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/quicktime',
  ],
};
