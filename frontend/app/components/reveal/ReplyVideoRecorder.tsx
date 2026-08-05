'use client';

import { useRef, useState, type ReactElement } from 'react';
import { useCameraRecorder } from '../../hooks/useCameraRecorder';
import { revokeVideoObjectUrl } from '../../services/futureVideoService';
import { DEFAULT_VIDEO_CONFIG } from '../../types/future-video';
import { CameraPermissionState } from '../future-video/CameraPermissionState';
import { CameraRecorder } from '../future-video/CameraRecorder';

interface ReplyVideoRecorderProps {
  /** Called once the recipient confirms the clip they want merged with the original. */
  onReplyReady: (video: Blob, durationSeconds: number) => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = Math.round(
  DEFAULT_VIDEO_CONFIG.maxSizeBytes / (1024 * 1024),
);

/**
 * Records (or accepts an uploaded) reply clip on the reveal page. Reuses the
 * same camera-recording building blocks as the compose-time future-video
 * step (see FutureVideoStep.tsx) but never uploads anything — the confirmed
 * blob is handed to the caller for client-side merging (mergeVideos.ts).
 */
export function ReplyVideoRecorder({
  onReplyReady,
  disabled = false,
}: ReplyVideoRecorderProps): ReactElement {
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

  const handleDeviceFileSelect = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Tệp đã chọn không phải tệp video hợp lệ.');
      return;
    }
    if (file.size > DEFAULT_VIDEO_CONFIG.maxSizeBytes) {
      alert(`Tệp video vượt quá dung lượng cho phép (${MAX_SIZE_MB} MB).`);
      return;
    }
    revokeVideoObjectUrl(filePreviewUrl);
    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    evt.target.value = '';
  };

  const activePreviewUrl = previewUrl || filePreviewUrl || '';
  const isRecordedState = cameraState === 'recorded' || Boolean(filePreviewUrl);

  const handleDiscard = () => {
    revokeVideoObjectUrl(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    retakeVideo();
  };

  const handleConfirm = () => {
    const target = selectedFile || videoBlob;
    if (!target) return;
    onReplyReady(target, recordingSeconds);
  };

  return (
    <div className="reply-video-recorder">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        style={{ display: 'none' }}
        onChange={handleDeviceFileSelect}
      />

      <div className="reply-video-stage">
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
              maxDurationSeconds={DEFAULT_VIDEO_CONFIG.maxDurationSeconds}
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
          <div className="video-preview-container">
            <div className="preview-stage">
              <video
                key={activePreviewUrl}
                className="recorded-video-player"
                src={activePreviewUrl}
                controls
                playsInline
                preload="auto"
              />
            </div>
            <div className="preview-actions-bar">
              <button
                type="button"
                className="button button-secondary btn-retake"
                onClick={handleDiscard}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="button button-primary btn-use-video"
                onClick={handleConfirm}
                disabled={disabled}
              >
                Ghép video này
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
