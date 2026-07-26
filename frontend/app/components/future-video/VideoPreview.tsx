import type { ReactElement } from 'react';

interface VideoPreviewProps {
  previewUrl: string;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  onRetake: () => void;
  onUseVideo: () => void;
  onDiscardVideo: () => void;
  onRetryUpload: () => void;
}

export function VideoPreview({
  previewUrl,
  isUploading,
  uploadProgress,
  uploadError,
  onRetake,
  onUseVideo,
  onDiscardVideo,
  onRetryUpload,
}: VideoPreviewProps): ReactElement {
  return (
    <div className="video-preview-container">
      <div className="preview-stage">
        <video
          key={previewUrl}
          className="recorded-video-player"
          src={previewUrl}
          controls
          playsInline
          preload="auto"
          onError={(e) => {
            console.warn('Video preview playback error:', e);
          }}
        />

        {isUploading && (
          <div className="uploading-overlay">
            <div className="spinner" />
            <p>Đang tải video lên và mã hóa bảo mật...</p>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-percent-text">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="upload-error-box" role="alert">
          <p>{uploadError}</p>
          <div className="error-actions">
            <button
              type="button"
              className="button button-secondary btn-retry"
              onClick={onRetryUpload}
            >
              Thử tải lại
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={onRetake}
            >
              Quay lại video khác
            </button>
          </div>
        </div>
      )}

      <div className="preview-actions-bar">
        <button
          type="button"
          className="button button-secondary btn-retake"
          onClick={onRetake}
          disabled={isUploading}
        >
          Quay lại
        </button>

        <button
          type="button"
          className="button button-secondary btn-discard"
          onClick={onDiscardVideo}
          disabled={isUploading}
        >
          Hủy video
        </button>

        <button
          type="button"
          className="button button-primary btn-use-video"
          onClick={onUseVideo}
          disabled={isUploading}
        >
          {isUploading ? 'Đang lưu...' : 'Sử dụng video này'}
        </button>
      </div>
    </div>
  );
}
