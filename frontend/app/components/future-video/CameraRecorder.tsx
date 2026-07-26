import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { CameraState } from '../../types/future-video';

interface CameraRecorderProps {
  cameraState: CameraState;
  stream: MediaStream | null;
  recordingSeconds: number;
  maxDurationSeconds: number;
  facingMode: 'user' | 'environment';
  isMuted: boolean;
  hasAudio: boolean;
  countdown: number | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleFacingMode: () => void;
  onToggleMute: () => void;
  onCloseCamera: () => void;
}

const PROMPT_SUGGESTIONS = [
  'Bạn đang cảm thấy thế nào ở thời điểm này?',
  'Bạn muốn nhắn điều gì với bản thân trong tương lai?',
  'Bạn hy vọng mình sẽ thay đổi điều gì?',
  'Hãy kể về một điều khiến bạn tự hào hôm nay.',
];

export function CameraRecorder({
  cameraState,
  stream,
  recordingSeconds,
  maxDurationSeconds,
  facingMode,
  isMuted,
  hasAudio,
  countdown,
  onStartRecording,
  onStopRecording,
  onToggleFacingMode,
  onToggleMute,
  onCloseCamera,
}: CameraRecorderProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activePromptIndex, setActivePromptIndex] = useState<number>(0);

  const isRecording = cameraState === 'recording';

  // Attach stream to video element when stream is updated
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch((err) => {
        console.warn('Video stream autoplay notice:', err);
      });
    }
  }, [stream]);

  // Format seconds to 00:00
  const formatTime = (totalSeconds: number): string => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const remainingSeconds = maxDurationSeconds - recordingSeconds;
  const isNearLimit = isRecording && remainingSeconds <= 15;

  return (
    <div className="camera-recorder-wrapper">
      {/* Prompt chips suggestions */}
      <div className="prompt-suggestions-bar">
        <div className="prompt-chip">
          <span>Gợi ý:</span>
          <strong>{PROMPT_SUGGESTIONS[activePromptIndex]}</strong>
          <button
            type="button"
            className="prompt-next-btn"
            onClick={() =>
              setActivePromptIndex(
                (prev) => (prev + 1) % PROMPT_SUGGESTIONS.length,
              )
            }
            title="Đổi gợi ý khác"
          >
          </button>
        </div>
      </div>

      {/* Camera Viewport Stage */}
      <div className="camera-viewport-stage">
        <video
          ref={videoRef}
          className="camera-video-preview"
          autoPlay
          playsInline
          muted
        />

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="countdown-overlay">
            <span className="countdown-number">{countdown}</span>
          </div>
        )}

        {/* Recording status badge */}
        {isRecording && (
          <div className="recording-status-overlay">
            <span className="recording-dot-pulsing" />
            <span className="recording-label">Đang quay</span>
            <span
              className={`recording-timer-badge ${
                isNearLimit ? 'is-warning' : ''
              }`}
            >
              {formatTime(recordingSeconds)} / {formatTime(maxDurationSeconds)}
            </span>
          </div>
        )}

        {/* Warning banner when < 15 seconds left */}
        {isNearLimit && (
          <div className="time-warning-banner">
            <span>⚠️ Sắp hết thời gian quay (còn {remainingSeconds} giây)</span>
          </div>
        )}

        {/* Mic audio warning if no audio device */}
        {!hasAudio && (
          <div className="audio-warning-chip">
            <span>Không tìm thấy microphone. Video sẽ quay không có âm thanh.</span>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="camera-controls-bar">
        {!isRecording ? (
          <>
            <button
              type="button"
              className="button button-secondary control-btn"
              onClick={onCloseCamera}
              title="Đóng camera"
            >
              Đóng camera
            </button>

            <button
              type="button"
              className="button button-secondary control-btn"
              onClick={onToggleFacingMode}
              title="Đổi camera trước / sau"
            >
              Camera: {facingMode === 'user' ? 'Trước' : 'Sau'}
            </button>

            <button
              type="button"
              className="button button-secondary control-btn"
              onClick={onToggleMute}
              disabled={!hasAudio}
              title="Bật / Tắt Microphone"
            >
              Micro: {isMuted ? 'Tắt' : 'Bật'}
            </button>

            <button
              type="button"
              className="button button-primary control-btn btn-start"
              onClick={onStartRecording}
              disabled={countdown !== null}
            >
              Bắt đầu quay
            </button>
          </>
        ) : (
          <button
            type="button"
            className="button button-primary control-btn btn-stop"
            onClick={onStopRecording}
          >
            Dừng quay
          </button>
        )}
      </div>
    </div>
  );
}
