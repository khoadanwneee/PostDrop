import type { ReactElement } from 'react';
import type { CameraErrorDetails, CameraState } from '../../types/future-video';

interface CameraPermissionStateProps {
  cameraState: CameraState;
  errorDetails: CameraErrorDetails | null;
  onRequestPermission: () => void;
  onSelectFileClick: () => void;
}

export function CameraPermissionState({
  cameraState,
  errorDetails,
  onRequestPermission,
  onSelectFileClick,
}: CameraPermissionStateProps): ReactElement {
  const isRequesting = cameraState === 'requesting-permission';

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

            <button
              type="button"
              className="button button-secondary btn-upload-device"
              onClick={onSelectFileClick}
              disabled={isRequesting}
            >
              Tải video từ thiết bị
            </button>
          </div>
        </>
      )}
    </div>
  );
}
