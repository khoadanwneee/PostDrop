import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CameraErrorDetails,
  CameraState,
  VideoConfig,
} from '../types/future-video';
import { DEFAULT_VIDEO_CONFIG } from '../types/future-video';
import { revokeVideoObjectUrl } from '../services/futureVideoService';

export interface UseCameraRecorderReturn {
  cameraState: CameraState;
  stream: MediaStream | null;
  videoBlob: Blob | null;
  previewUrl: string | null;
  recordingSeconds: number;
  facingMode: 'user' | 'environment';
  isMuted: boolean;
  hasAudio: boolean;
  errorDetails: CameraErrorDetails | null;
  selectedMimeType: string;
  countdown: number | null;
  isCountdownEnabled: boolean;
  setIsCountdownEnabled: (enabled: boolean) => void;
  requestCameraPermission: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  retakeVideo: () => void;
  toggleFacingMode: () => Promise<void>;
  toggleMute: () => void;
  closeCamera: () => void;
  resetAll: () => void;
}

export function useCameraRecorder(
  config: VideoConfig = DEFAULT_VIDEO_CONFIG,
): UseCameraRecorderReturn {
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasAudio, setHasAudio] = useState<boolean>(true);
  const [errorDetails, setErrorDetails] = useState<CameraErrorDetails | null>(
    null,
  );
  const [selectedMimeType, setSelectedMimeType] = useState<string>('video/webm');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownEnabled, setIsCountdownEnabled] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const permissionRequestRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);

  // Pick supported MIME type
  const getSupportedMimeType = useCallback(() => {
    if (typeof window === 'undefined' || !window.MediaRecorder) {
      return 'video/webm';
    }
    for (const mimeType of config.allowedMimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return 'video/webm';
  }, [config.allowedMimeTypes]);

  // Clean up media stream tracks
  const stopStreamTracks = useCallback((currentStream: MediaStream | null) => {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const releaseMediaResources = useCallback(() => {
    permissionRequestRef.current += 1;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    timerIntervalRef.current = null;
    countdownTimerRef.current = null;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }
    mediaRecorderRef.current = null;

    stopStreamTracks(streamRef.current);
    streamRef.current = null;
  }, [stopStreamTracks]);

  // Close camera and release resources
  const closeCamera = useCallback(() => {
    releaseMediaResources();
    setStream(null);
    setCountdown(null);
    if (cameraState !== 'recorded' && cameraState !== 'completed') {
      setCameraState('idle');
    }
  }, [cameraState, releaseMediaResources]);

  // Request camera and microphone access
  const requestCameraPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.mediaDevices) {
      setErrorDetails({
        type: 'unsupported',
        message: 'Trình duyệt của bạn không hỗ trợ truy cập camera.',
      });
      setCameraState('error');
      return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setErrorDetails({
        type: 'insecure-context',
        message: 'Camera chỉ hoạt động trên giao thức HTTPS bảo mật.',
      });
      setCameraState('error');
      return;
    }

    setCameraState('requesting-permission');
    setErrorDetails(null);
    const requestId = permissionRequestRef.current + 1;
    permissionRequestRef.current = requestId;

    // Stop current stream if switching modes
    stopStreamTracks(streamRef.current);
    streamRef.current = null;

    let newStream: MediaStream | null = null;
    let audioSuccess = true;

    try {
      // Try acquiring video + audio first
      newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } },
        audio: true,
      });
    } catch {
      if (!mountedRef.current || permissionRequestRef.current !== requestId) return;
      try {
        // Fallback facingMode without exact constraint
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: true,
        });
      } catch {
        if (!mountedRef.current || permissionRequestRef.current !== requestId) return;
        try {
          // Fallback to video only if mic is unavailable or blocked
          newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          audioSuccess = false;
        } catch (err: unknown) {
          const DOMErr = err as DOMException;
          let errType: CameraErrorDetails['type'] = 'unknown';
          let message = 'Không thể mở camera. Vui lòng kiểm tra lại thiết bị.';

          if (DOMErr.name === 'NotAllowedError' || DOMErr.name === 'PermissionDeniedError') {
            errType = 'permission-denied';
            message = 'Bạn chưa cấp quyền sử dụng camera. Hãy cho phép quyền camera trong cài đặt trình duyệt hoặc tải video có sẵn từ thiết bị.';
          } else if (DOMErr.name === 'NotFoundError' || DOMErr.name === 'DevicesNotFoundError') {
            errType = 'not-found';
            message = 'Không tìm thấy camera trên thiết bị này. Bạn có thể tải video có sẵn để tiếp tục.';
          } else if (DOMErr.name === 'NotReadableError' || DOMErr.name === 'TrackStartError') {
            errType = 'in-use';
            message = 'Camera có thể đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó và thử lại.';
          }

          setErrorDetails({ type: errType, message });
          setCameraState('error');
          return;
        }
      }
    }

    if (!mountedRef.current || permissionRequestRef.current !== requestId) {
      stopStreamTracks(newStream);
      return;
    }

    setHasAudio(audioSuccess);
    streamRef.current = newStream;
    setStream(newStream);
    setSelectedMimeType(getSupportedMimeType());
    setCameraState('camera-ready');
  }, [facingMode, getSupportedMimeType, stopStreamTracks]);

  // Toggle camera (Front / Back)
  const toggleFacingMode = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (cameraState === 'camera-ready') {
      stopStreamTracks(streamRef.current);
      streamRef.current = null;
      setStream(null);
      // Wait microtask to apply new facingMode in requestCameraPermission
      setTimeout(() => {
        requestCameraPermission();
      }, 50);
    }
  }, [cameraState, facingMode, requestCameraPermission, stopStreamTracks]);

  // Toggle Mute audio track
  const toggleMute = useCallback(() => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted; // Toggle enabled state
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted, stream]);

  // Stop recording execution
  const stopRecordingInternal = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Public stop recording trigger
  const stopRecording = useCallback(() => {
    stopRecordingInternal();
  }, [stopRecordingInternal]);

  // Execute recording launch
  const executeStartRecording = useCallback(() => {
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();

    try {
      let recorder: MediaRecorder;
      if (mimeType && typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
        recorder = new MediaRecorder(stream, { mimeType });
      } else {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          chunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = () => {
        stopStreamTracks(streamRef.current || stream);
        streamRef.current = null;
        setStream(null);

        // Strip codec query parameter for clean playable Blob MIME type
        const actualMimeType = recorder.mimeType || mimeType || 'video/webm';
        const cleanMimeType = (actualMimeType.split(';')[0] || 'video/webm').trim();

        const blob = new Blob(chunksRef.current, { type: cleanMimeType });

        if (blob.size === 0) {
          setErrorDetails({
            type: 'unknown',
            message: 'Video thu được bị rỗng (0 byte). Vui lòng thử lại.',
          });
          setCameraState('error');
          return;
        }

        if (blob.size > config.maxSizeBytes) {
          setErrorDetails({
            type: 'unknown',
            message: 'Video vượt quá dung lượng cho phép. Vui lòng quay video ngắn hơn hoặc chọn video khác.',
          });
          setCameraState('error');
          return;
        }

        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setPreviewUrl(url);
        setCameraState('recorded');
      };

      // Call start() without timeslice to write a single continuous container with valid duration & keyframes
      recorder.start();
      setRecordingSeconds(0);
      setCameraState('recording');

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= config.maxDurationSeconds) {
            stopRecordingInternal();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
      setErrorDetails({
        type: 'unsupported',
        message: 'Trình duyệt không thể ghi hình bằng MediaRecorder.',
      });
      setCameraState('error');
    }
  }, [config.maxDurationSeconds, config.maxSizeBytes, getSupportedMimeType, stopRecordingInternal, stopStreamTracks, stream]);

  // Start recording with optional 3-2-1 countdown
  const startRecording = useCallback(() => {
    if (cameraState !== 'camera-ready' || !stream) return;

    if (isCountdownEnabled) {
      setCountdown(3);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            setCountdown(null);
            executeStartRecording();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      executeStartRecording();
    }
  }, [cameraState, executeStartRecording, isCountdownEnabled, stream]);

  // Retake video
  const retakeVideo = useCallback(() => {
    revokeVideoObjectUrl(previewUrl);
    setVideoBlob(null);
    setPreviewUrl(null);
    setRecordingSeconds(0);
    requestCameraPermission();
  }, [previewUrl, requestCameraPermission]);

  // Reset all state
  const resetAll = useCallback(() => {
    releaseMediaResources();
    revokeVideoObjectUrl(previewUrlRef.current);
    previewUrlRef.current = null;
    setStream(null);
    setVideoBlob(null);
    setPreviewUrl(null);
    setRecordingSeconds(0);
    setErrorDetails(null);
    setCountdown(null);
    setCameraState('idle');
  }, [releaseMediaResources]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  // Cleanup on unmount. Refs ensure that even a newly acquired stream is
  // released instead of relying on state captured by an older render.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      releaseMediaResources();
      revokeVideoObjectUrl(previewUrlRef.current);
      previewUrlRef.current = null;
    };
  }, [releaseMediaResources]);

  return {
    cameraState,
    stream,
    videoBlob,
    previewUrl,
    recordingSeconds,
    facingMode,
    isMuted,
    hasAudio,
    errorDetails,
    selectedMimeType,
    countdown,
    isCountdownEnabled,
    setIsCountdownEnabled,
    requestCameraPermission,
    startRecording,
    stopRecording,
    retakeVideo,
    toggleFacingMode,
    toggleMute,
    closeCamera,
    resetAll,
  };
}
