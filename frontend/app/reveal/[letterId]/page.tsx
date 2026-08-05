'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ReplyVideoRecorder } from '@/app/components/reveal/ReplyVideoRecorder';
import {
  exchangeRevealToken,
  fetchRevealAttachmentBlob,
  fetchRevealContent,
  type RevealAttachment,
  type RevealContentResponse,
} from '@/app/lib/reveal/reveal-client';
import { mergeVideos } from '@/app/lib/reveal/mergeVideos';

type Stage = 'loading' | 'invalid' | 'not-ready' | 'ready' | 'expired';
type MergeStatus = 'idle' | 'loading-engine' | 'processing' | 'done' | 'error';

const PAPER_COLORS: Record<string, string> = {
  ivory: '#fffdf8',
  rose: '#fff6f3',
  warm: '#f7eddf',
  sage: '#f3f6ed',
  lavender: '#f7f2fa',
  sky: '#f1f8fb',
  parchment: '#f4e7cf',
  linen: '#f8f3ea',
};

function readCapabilityToken(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.get('token');
}

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Loads every non-future-video attachment as an object URL, positioned by
 * its stored x/y/scale percentages (the only visual placement data the
 * backend actually persists — see Stage 4 notes on sealed_presentation). */
function useAttachmentImages(
  attachments: RevealAttachment[],
  sessionToken: string,
) {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    (async () => {
      for (const attachment of attachments) {
        if (!attachment.mimeType.startsWith('image/')) continue;
        const blob = await fetchRevealAttachmentBlob(
          attachment.contentPath,
          sessionToken,
        );
        if (cancelled || !blob) continue;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        setImages((current) => ({ ...current, [attachment.id]: url }));
      }
    })();

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
    // attachments is derived fresh each render from `content`; only re-run
    // when the letter/session actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  return images;
}

export default function RevealPage() {
  const params = useParams<{ letterId: string }>();
  const letterId = typeof params?.letterId === 'string' ? params.letterId : '';

  const [stage, setStage] = useState<Stage>('loading');
  const [sessionToken, setSessionToken] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [content, setContent] = useState<RevealContentResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  const [showReplyRecorder, setShowReplyRecorder] = useState(false);
  const [mergeStatus, setMergeStatus] = useState<MergeStatus>('idle');
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);

  const letterCardRef = useRef<HTMLDivElement>(null);

  // Entrance animation: mount in a hidden state, then flip a class on the
  // next frame so the CSS transition actually runs.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!letterId) return;
    const token = readCapabilityToken();
    let cancelled = false;

    (async () => {
      // A microtask hop before the first setState keeps this compliant with
      // the "no synchronous setState in an effect body" rule even on the
      // no-token fast path.
      await Promise.resolve();
      if (cancelled) return;
      if (!token) {
        setStage('invalid');
        return;
      }

      const exchange = await exchangeRevealToken(letterId, token);
      if (cancelled) return;
      if (!exchange.ok) {
        setStage(exchange.reason === 'not-ready' ? 'not-ready' : 'invalid');
        return;
      }
      setSessionToken(exchange.result.sessionToken);
      setExpiresAt(exchange.result.expiresAt);

      const revealed = await fetchRevealContent(
        letterId,
        exchange.result.sessionToken,
      );
      if (cancelled) return;
      if (!revealed) {
        setStage('invalid');
        return;
      }
      setContent(revealed);
      setStage('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [letterId]);

  useEffect(() => {
    if (!expiresAt || stage !== 'ready') return;
    const tick = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(remaining);
      if (remaining <= 0) setStage('expired');
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, stage]);

  const presentation = content?.presentation;
  const futureVideoAttachment = presentation?.attachments.find(
    (attachment) => attachment.role === 'future_video',
  );
  const visibleAttachments = useMemo(
    () =>
      (presentation?.attachments ?? []).filter(
        (attachment) => attachment.role !== 'future_video',
      ),
    [presentation],
  );
  const attachmentImages = useAttachmentImages(
    visibleAttachments,
    sessionToken,
  );

  const paperColor =
    (presentation && PAPER_COLORS[presentation.paper]) || PAPER_COLORS.ivory;
  const fontClass = `reveal-font-${presentation?.font ?? 'serif'}`;

  const handleDownloadPng = async () => {
    if (!letterCardRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(letterCardRef.current, {
      backgroundColor: paperColor,
      scale: 2,
      useCORS: true,
    });
    const url = canvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${presentation?.title || 'la-thu'}.png`;
    anchor.click();
  };

  const handleReplyReady = async (replyBlob: Blob) => {
    setMergeError(null);
    setMergedVideoUrl(null);
    if (!futureVideoAttachment) {
      setMergeError('Không tìm thấy video gốc để ghép.');
      setMergeStatus('error');
      return;
    }
    try {
      const originalBlob = await fetchRevealAttachmentBlob(
        futureVideoAttachment.contentPath,
        sessionToken,
      );
      if (!originalBlob) {
        throw new Error('Không thể tải video gốc.');
      }
      const merged = await mergeVideos(originalBlob, replyBlob, {
        onStatus: setMergeStatus,
        onProgress: setMergeProgress,
      });
      setMergedVideoUrl(URL.createObjectURL(merged));
      setMergeStatus('done');
    } catch (error) {
      setMergeError(
        error instanceof Error
          ? error.message
          : 'Không thể ghép video. Vui lòng thử lại.',
      );
      setMergeStatus('error');
    }
  };

  if (stage === 'loading') {
    return (
      <main className="reveal-page reveal-state-page">
        <div className="skeleton" style={{ maxWidth: 420, width: '100%' }} />
      </main>
    );
  }

  if (stage === 'invalid' || stage === 'not-ready' || stage === 'expired') {
    const copy = {
      invalid: {
        title: 'Đường dẫn không hợp lệ hoặc đã hết hạn.',
        body: 'Vui lòng kiểm tra lại email PostDrop đã gửi cho bạn, hoặc liên hệ người gửi để nhận lại đường dẫn.',
      },
      'not-ready': {
        title: 'Lá thư chưa đến ngày mở.',
        body: 'PostDrop sẽ gửi email cho bạn ngay khi lá thư sẵn sàng để mở.',
      },
      expired: {
        title: 'Phiên xem đã hết hạn (30 phút).',
        body: 'Mở lại đường dẫn trong email để bắt đầu một phiên xem mới.',
      },
    }[stage];

    return (
      <main className="reveal-page reveal-state-page">
        <section className="payment-card" style={{ textAlign: 'center' }}>
          <span className="eyebrow">POSTDROP</span>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="hero-actions">
            <Link className="button button-secondary" href="/">
              Về trang chủ
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!presentation) return null;

  return (
    <main className={`reveal-page ${mounted ? 'reveal-mounted' : ''}`}>
      {/* Reuses the camera-recorder styling from the compose-time editor
          (letter-editor.css isn't part of the Next.js global stylesheet). */}
      <link rel="stylesheet" href="/letter-editor.css" />
      {remainingMs !== null && (
        <div className="reveal-countdown" role="status">
          Phiên xem này sẽ khóa lại sau {formatCountdown(remainingMs)}
        </div>
      )}

      <section
        ref={letterCardRef}
        className={`reveal-letter-card ${fontClass}`}
        style={{ background: paperColor }}
      >
        <span className="eyebrow">GỬI ĐẾN {presentation.recipientName}</span>
        <h1 className="reveal-letter-title">{presentation.title}</h1>
        <p className="reveal-letter-content">{presentation.content}</p>

        {visibleAttachments.map((attachment) => {
          const url = attachmentImages[attachment.id];
          if (!url) return null;
          const hasPlacement =
            attachment.x !== undefined && attachment.y !== undefined;
          return (
            <img
              key={attachment.id}
              src={url}
              alt={attachment.altText || ''}
              className="reveal-attachment-image"
              style={
                hasPlacement
                  ? {
                      position: 'absolute',
                      left: `${attachment.x}%`,
                      top: `${attachment.y}%`,
                      transform: `translate(-50%, -50%) scale(${
                        attachment.scale ?? 1
                      }) rotate(${attachment.rotation ?? 0}deg)`,
                      zIndex: attachment.zIndex,
                    }
                  : undefined
              }
            />
          );
        })}
      </section>

      <div className="reveal-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={handleDownloadPng}
        >
          Tải ảnh PNG
        </button>
        {futureVideoAttachment && !showReplyRecorder && !mergedVideoUrl && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setShowReplyRecorder(true)}
          >
            Quay video phản hồi
          </button>
        )}
      </div>

      {showReplyRecorder && mergeStatus === 'idle' && (
        <section className="reveal-reply-section">
          <h2>Gửi một lời nhắn lại cho chính mình lúc trước</h2>
          <ReplyVideoRecorder onReplyReady={handleReplyReady} />
        </section>
      )}

      {(mergeStatus === 'loading-engine' || mergeStatus === 'processing') && (
        <section className="reveal-reply-section reveal-merge-progress">
          <div className="spinner" />
          <p>
            {mergeStatus === 'loading-engine'
              ? 'Đang chuẩn bị công cụ ghép video…'
              : `Đang ghép video… ${Math.round(mergeProgress * 100)}%`}
          </p>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.round(mergeProgress * 100)}%` }}
            />
          </div>
        </section>
      )}

      {mergeStatus === 'error' && mergeError && (
        <section className="reveal-reply-section upload-error-box" role="alert">
          <p>{mergeError}</p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setMergeStatus('idle');
              setMergeError(null);
            }}
          >
            Thử lại
          </button>
        </section>
      )}

      {mergeStatus === 'done' && mergedVideoUrl && (
        <section className="reveal-reply-section">
          <video
            src={mergedVideoUrl}
            controls
            playsInline
            className="reveal-merged-video"
          />
          <a
            className="button button-primary"
            href={mergedVideoUrl}
            download={`${presentation.title || 'la-thu'}-video.mp4`}
          >
            Tải video đã ghép
          </a>
        </section>
      )}
    </main>
  );
}
