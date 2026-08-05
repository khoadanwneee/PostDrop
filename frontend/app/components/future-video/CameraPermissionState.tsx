import { useRef, useState, type DragEvent, type ReactElement } from 'react';
import type { CameraErrorDetails, CameraState } from '../../types/future-video';

interface CameraPermissionStateProps {
  cameraState: CameraState;
  errorDetails: CameraErrorDetails | null;
  fileError: string | null;
  onRequestPermission: () => void;
  onSelectFileClick: () => void;
  onFileDrop: (file: File) => void;
}

export function CameraPermissionState({
  cameraState,
  errorDetails,
  fileError,
  onRequestPermission,
  onSelectFileClick,
  onFileDrop,
}: CameraPermissionStateProps): ReactElement {
  const isRequesting = cameraState === 'requesting-permission';
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileDrop(file);
  };

  return (
    <div className="camera-permission-container">
      <div className="camera-illustration" aria-hidden="true">
        <div className="camera-lens-graphic">
          <div className="lens-inner" />
          <span className="lens-reflection" />
        </div>
      </div>

      {isRequesting ? (
        <div className="permission-loading-box" aria-live="polite">
          <div className="spinner" />
          <p>Đang yêu cầu quyền truy cập camera và microphone...</p>
        </div>
      ) : (
        <>
          {errorDetails && (
            <div className="camera-error-banner" role="alert">
              <strong>Lỗi kết nối camera</strong>
              <p>{errorDetails.message}</p>
            </div>
          )}

          <div className="permission-actions-group">
            <button
              type="button"
              className="button button-primary btn-open-camera"
              onClick={onRequestPermission}
              disabled={isRequesting}
            >
              Mở camera
            </button>
          </div>

          <div
            className={`video-drop-zone${isDragging ? ' is-dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            aria-label="Khu vực tải video bằng cách kéo và thả"
          >
            <span className="video-drop-icon" aria-hidden="true">⇧</span>
            <div className="video-drop-copy">
              <strong>{isDragging ? 'Thả video để tải lên' : 'Kéo và thả video vào đây'}</strong>
              <span>MP4, WebM hoặc MOV · tối đa 100 MB</span>
            </div>
            <button
              type="button"
              className="button button-secondary btn-upload-device"
              onClick={onSelectFileClick}
              disabled={isRequesting}
            >
              Tải video từ thiết bị
            </button>
            {fileError && <p className="video-file-error" role="alert">{fileError}</p>}
          </div>
        </>
      )}
    </div>
  );
}
