import { useRef, useState, type ReactElement } from 'react';
import { useCameraRecorder } from '../../hooks/useCameraRecorder';
import { useVideoUpload } from '../../hooks/useVideoUpload';
import { revokeVideoObjectUrl } from '../../services/futureVideoService';
import type { UploadedVideo } from '../../types/future-video';
import { CameraPermissionState } from './CameraPermissionState';
import { CameraRecorder } from './CameraRecorder';
import { VideoPreview } from './VideoPreview';

interface FutureVideoStepProps {
  userId?: string;
  letterId?: string;
  initialVideoUrl?: string | null;
  onVideoConfirmed: (videoData: UploadedVideo) => void;
  onSkipStep: () => void;
  onBackStep?: () => void;
}

export function FutureVideoStep({
  userId = 'user_guest',
  letterId = 'letter_draft',
  initialVideoUrl = null,
  onVideoConfirmed,
  onSkipStep,
  onBackStep,
}: FutureVideoStepProps): ReactElement {
  const [showSkipModal, setShowSkipModal] = useState<boolean>(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  } = useCameraRecorder();

  const {
    isUploading,
    uploadProgress,
    uploadError,
    uploadVideoFile,
    resetUpload,
  } = useVideoUpload();

  // Handle local video file upload selection
  const handleDeviceFileSelect = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Tệp đã chọn không phải tệp video hợp lệ.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('Tệp video vượt quá dung lượng cho phép (100 MB).');
      return;
    }

    revokeVideoObjectUrl(filePreviewUrl);
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(url);
    evt.target.value = '';
  };

  const activePreviewUrl =
    previewUrl || filePreviewUrl || initialVideoUrl || '';

  // Confirm and upload video
  const handleUseVideo = async () => {
    const targetPayload = selectedFile || videoBlob;
    if (!targetPayload && !initialVideoUrl) {
      alert('Chưa có video để sử dụng.');
      return;
    }

    if (targetPayload) {
      const result = await uploadVideoFile(
        targetPayload,
        userId,
        letterId,
        recordingSeconds,
      );
      if (result) {
        onVideoConfirmed(result);
      }
    } else if (initialVideoUrl) {
      onVideoConfirmed({
        id: `existing_${Date.now()}`,
        url: initialVideoUrl,
        storagePath: `future-videos/${userId}/${letterId}/existing.webm`,
        fileName: 'existing-video.webm',
        mimeType: 'video/webm',
        size: 1,
        createdAt: new Date().toISOString(),
      });
    }
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
              onRequestPermission={requestCameraPermission}
              onSelectFileClick={() => fileInputRef.current?.click()}
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
        {onBackStep ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={onBackStep}
            disabled={isUploading || cameraState === 'recording'}
          >
            Quay lại bước 3
          </button>
        ) : (
          <span />
        )}

        <div className="builder-actions-group">
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
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal skip-confirmation-modal">
            <h2>Bạn có chắc muốn bỏ qua video?</h2>
            <p>
              Bạn vẫn có thể tiếp tục tạo bức thư mà không cần quay video. Lời
              nhắn chữ của bạn vẫn được lưu giữ nguyên vẹn.
            </p>
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
                  onSkipStep();
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
