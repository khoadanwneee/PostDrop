import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useCameraRecorder } from '../../hooks/useCameraRecorder';
import { useVideoUpload } from '../../hooks/useVideoUpload';
import {
  revokeVideoObjectUrl,
  validateFutureVideoFile,
} from '../../services/futureVideoService';
import type { UploadedVideo } from '../../types/future-video';
import { CameraPermissionState } from './CameraPermissionState';
import { CameraRecorder } from './CameraRecorder';
import { VideoPreview } from './VideoPreview';

interface FutureVideoStepProps {
  /** Real backend letter UUID. Undefined/empty while the draft is still being prepared. */
  letterId?: string;
  initialVideoUrl?: string | null;
  onVideoConfirmed: (videoData: UploadedVideo) => void;
  onSkipStep: () => void;
  onBackStep?: () => void;
}

const MAX_SIZE_MB = Math.round(
  DEFAULT_VIDEO_CONFIG.maxSizeBytes / (1024 * 1024),
);

export function FutureVideoStep({
  letterId,
  initialVideoUrl = null,
  onVideoConfirmed,
  onSkipStep,
  onBackStep,
}: FutureVideoStepProps): ReactElement {
  const [showSkipModal, setShowSkipModal] = useState<boolean>(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    cameraState,
    stream,
    videoBlob,
    previewUrl,
    recordingSeconds,
    facingMode,
    isMuted,
    hasAudio,
    errorDetails,
    countdown,
    requestCameraPermission,
    startRecording,
    stopRecording,
    retakeVideo,
    toggleFacingMode,
    toggleMute,
    closeCamera,
    resetAll,
  } = useCameraRecorder();

  const {
    isUploading,
    uploadProgress,
    uploadError,
    uploadVideoFile,
    resetUpload,
  } = useVideoUpload();

  const handleVideoFile = useCallback((file: File) => {
    const validationError = validateFutureVideoFile(file);
    setFileError(validationError);
    if (validationError) return;
    revokeVideoObjectUrl(filePreviewUrl);
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(url);
  }, [filePreviewUrl]);

  // Handle local video file upload selection
  const handleDeviceFileSelect = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    handleVideoFile(file);
    evt.target.value = '';
  };

  const activePreviewUrl =
    previewUrl || filePreviewUrl || initialVideoUrl || '';

  const releaseStepResources = useCallback(() => {
    resetAll();
    revokeVideoObjectUrl(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
  }, [filePreviewUrl, resetAll]);

  useEffect(() => {
    return () => revokeVideoObjectUrl(filePreviewUrl);
  }, [filePreviewUrl]);

  // Confirm and upload video
  const handleUseVideo = async () => {
    const targetPayload = selectedFile || videoBlob;
    if (!targetPayload && !initialVideoUrl) {
      alert('Chưa có video để sử dụng.');
      return;
    }
    if (!letterId) {
      alert('Đang chuẩn bị bản nháp lá thư, vui lòng thử lại sau vài giây.');
      return;
    }

    if (targetPayload) {
      const result = await uploadVideoFile(
        targetPayload,
        letterId,
        recordingSeconds,
      );
      if (result) {
        releaseStepResources();
        onVideoConfirmed(result);
      }
    } else if (initialVideoUrl) {
      releaseStepResources();
      onVideoConfirmed({
        id: `existing_${Date.now()}`,
        url: initialVideoUrl,
        storagePath: `future-videos/${letterId}/existing.webm`,
        fileName: 'existing-video.webm',
        mimeType: 'video/webm',
        size: 1,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleBackStep = () => {
    releaseStepResources();
    onBackStep?.();
  };

  const handleSkipStep = () => {
    releaseStepResources();
    onSkipStep();
  };

  // Discard video / retake
  const handleDiscardVideo = () => {
    revokeVideoObjectUrl(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    resetUpload();
    retakeVideo();
  };

  const isRecordedState =
    cameraState === 'recorded' || Boolean(filePreviewUrl) || Boolean(initialVideoUrl);

  return (
    <div className="future-video-step-container">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        style={{ display: 'none' }}
        onChange={handleDeviceFileSelect}
      />

      {/* Header Info */}
      <div className="future-video-header">
        <span className="eyebrow-tag">BƯỚC 3.5 — QUAY VIDEO CHO TƯƠNG LAI</span>
        <h1 className="future-video-title">
          Gửi một lời nhắn cho chính mình trong tương lai
        </h1>
        <p className="future-video-description">
          Quay lại cảm xúc, suy nghĩ hoặc lời nhắn của bạn ở thời điểm hiện tại.
          Video này sẽ được lưu cùng bức thư và chỉ được mở vào thời điểm bạn
          đã chọn.
        </p>
      </div>

      {/* Main Container Stage */}
      <div className="future-video-stage">
        {(cameraState === 'idle' ||
          cameraState === 'requesting-permission' ||
          cameraState === 'error') &&
          !isRecordedState && (
            <CameraPermissionState
              cameraState={cameraState}
              errorDetails={errorDetails}
              fileError={fileError}
              onRequestPermission={requestCameraPermission}
              onSelectFileClick={() => fileInputRef.current?.click()}
              onFileDrop={handleVideoFile}
            />
          )}

        {(cameraState === 'camera-ready' || cameraState === 'recording') &&
          !isRecordedState && (
            <CameraRecorder
              cameraState={cameraState}
              stream={stream}
              recordingSeconds={recordingSeconds}
              maxDurationSeconds={180}
              facingMode={facingMode}
              isMuted={isMuted}
              hasAudio={hasAudio}
              countdown={countdown}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onToggleFacingMode={toggleFacingMode}
              onToggleMute={toggleMute}
              onCloseCamera={closeCamera}
            />
          )}

        {isRecordedState && activePreviewUrl && (
          <VideoPreview
            previewUrl={activePreviewUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            onRetake={handleDiscardVideo}
            onUseVideo={handleUseVideo}
            onDiscardVideo={handleDiscardVideo}
            onRetryUpload={handleUseVideo}
          />
        )}
      </div>

      {/* Bottom Bar Actions */}
      <div className="builder-actions future-video-actions">
        <span />
        <div className="builder-actions-group">
          {onBackStep && (
            <button
              type="button"
              className="button button-secondary"
              onClick={handleBackStep}
              disabled={isUploading || cameraState === 'recording'}
            >
              Quay lại
            </button>
          )}
          <button
            type="button"
            className="button button-secondary btn-skip-video"
            onClick={() => setShowSkipModal(true)}
            disabled={isUploading || cameraState === 'recording'}
          >
            Bỏ qua bước này
          </button>
        </div>
      </div>

      {/* Skip Confirmation Dialog */}
      {showSkipModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="skip-video-modal-title"
        >
          <div className="modal skip-confirmation-modal">
            <div className="skip-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="6" width="13" height="12" rx="2" />
                <path d="m16 10 5-3v10l-5-3" />
                <path d="M8 10.5v3M6.5 12h3" />
              </svg>
            </div>
            <div className="skip-modal-copy">
              <span className="skip-modal-kicker">Bước không bắt buộc</span>
              <h2 id="skip-video-modal-title">Bỏ qua lời nhắn video?</h2>
              <p>
                Bạn vẫn có thể tiếp tục tạo lá thư. Toàn bộ lời nhắn chữ và
                thiết kế hiện tại sẽ được giữ nguyên.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowSkipModal(false)}
              >
                Tiếp tục quay video
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setShowSkipModal(false);
                  handleSkipStep();
                }}
              >
                Bỏ qua và sang bước 4
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
