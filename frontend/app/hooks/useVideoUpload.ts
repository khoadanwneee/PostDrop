import { useCallback, useState } from 'react';
import type { UploadedVideo, VideoConfig } from '../types/future-video';
import { DEFAULT_VIDEO_CONFIG } from '../types/future-video';
import { uploadFutureVideo } from '../services/futureVideoService';

export interface UseVideoUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadedVideo: UploadedVideo | null;
  uploadError: string | null;
  uploadVideoFile: (
    file: Blob | File,
    letterId: string,
    durationSeconds?: number,
  ) => Promise<UploadedVideo | null>;
  resetUpload: () => void;
}

export function useVideoUpload(
  config: VideoConfig = DEFAULT_VIDEO_CONFIG,
): UseVideoUploadReturn {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadVideoFile = useCallback(
    async (
      file: Blob | File,
      letterId: string,
      durationSeconds?: number,
    ): Promise<UploadedVideo | null> => {
      if (!file) return null;

      // Validation 1: Size check
      if (file.size > config.maxSizeBytes) {
        const maxMb = Math.round(config.maxSizeBytes / (1024 * 1024));
        setUploadError(
          `Video vượt quá dung lượng cho phép (tối đa ${maxMb} MB). Vui lòng chọn tệp nhỏ hơn.`,
        );
        return null;
      }

      // Validation 2: File non-empty check
      if (file.size === 0) {
        setUploadError('Tệp video không hợp lệ hoặc có dung lượng 0 byte.');
        return null;
      }

      setIsUploading(true);
      setUploadProgress(10);
      setUploadError(null);

      try {
        // Simulate upload progress steps for responsiveness
        const progressTimer = setInterval(() => {
          setUploadProgress((prev) => (prev < 90 ? prev + 20 : prev));
        }, 150);

        const result = await uploadFutureVideo(file, letterId, durationSeconds);

        clearInterval(progressTimer);
        setUploadProgress(100);
        setUploadedVideo(result);
        setIsUploading(false);
        return result;
      } catch (err) {
        setIsUploading(false);
        setUploadProgress(0);
        const errMsg =
          err instanceof Error
            ? err.message
            : 'Không thể tải video lên. Vui lòng kiểm tra kết nối mạng và thử lại.';
        setUploadError(errMsg);
        return null;
      }
    },
    [config.maxSizeBytes],
  );

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadedVideo(null);
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadedVideo,
    uploadError,
    uploadVideoFile,
    resetUpload,
  };
}
