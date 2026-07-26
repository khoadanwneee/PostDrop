'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const LetterEditorBridge = dynamic(
  () =>
    import('./components/letter-editor/letter-editor-bridge').then(
      (module) => module.LetterEditorBridge,
    ),
  { ssr: false },
);

export default function HomePage() {
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Avoid reloading if script is already present
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.body.appendChild(script);
      });
    };

    const loadScripts = async () => {
      void loadScript(
        'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js',
      ).catch((err) => {
        console.warn(
          'Anime.js could not be loaded; using the reduced intro fallback.',
          err,
        );
      });
      try {
        await loadScript('/app.js');
      } catch (err) {
        console.error('Error loading the PostDrop client:', err);
      }
    };

    loadScripts();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Đi đến nội dung chính
      </a>
      <div id="intro" className="intro" aria-label="Mở lá thư từ tương lai">
        <div className="intro-glow" aria-hidden="true" />
        <div className="intro-topbar">
          <div className="intro-brand" aria-label="PostDrop">
            <span className="brand-mark" />
            <strong>PostDrop</strong>
          </div>
          <button id="skip-intro" className="intro-skip text-button">
            Bỏ qua <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="floating-notes" aria-hidden="true">
          <span className="floating-note note-one">11 · 07 · 2027</span>
          <span className="floating-note note-two">POSTDROP</span>
          <span className="floating-note note-three">GỬI ĐẾN TƯƠNG LAI</span>
        </div>
        <div className="intro-copy">
          <span className="eyebrow">POSTDROP · THƯ GỬI ĐẾN TƯƠNG LAI</span>
          <h1>Một lá thư đang chờ bạn.</h1>
          <p>Được gửi từ một ngày đã qua, dành riêng cho khoảnh khắc này.</p>
        </div>
        <div className="envelope-stage">
          <svg className="mail-trail" viewBox="0 0 780 360" fill="none" aria-hidden="true">
            <path d="M70 282C201 334 324 295 414 211C502 128 591 74 734 91" />
          </svg>
          <div className="intro-letter" aria-hidden="true">
            <small className="letter-kicker">POSTDROP · 11.07.2027</small>
            <strong className="letter-greeting">Gửi bạn của ngày mai,</strong>
            <span className="letter-line line-long" />
            <span className="letter-line line-medium" />
            <span className="letter-line line-short" />
            <em className="letter-signature">Từ bạn, của một ngày đã qua.</em>
          </div>
          <svg
            className="paper-plane intro-paper-plane"
            viewBox="0 0 180 140"
            aria-hidden="true"
          >
            <path className="paper-plane-body" d="M10 72 168 14 116 126 78 88Z" />
            <path className="paper-plane-wing" d="M10 72 78 88 168 14 92 78Z" />
            <path className="paper-plane-fold" d="M78 88 116 126 92 78 168 14" />
          </svg>
          <div className="envelope">
            <div className="envelope-back" />
            <div className="envelope-flap" />
            <div className="envelope-front">
              <div className="stamp">
                <span>PD</span>
                <small>2027</small>
              </div>
              <div className="postmark">
                11 · 07
                <br />
                TƯƠNG LAI
              </div>
              <p>
                Gửi đến bạn,
                <br />
                <span>từ một ngày trong quá khứ.</span>
              </p>
            </div>
            <button
              id="seal-trigger"
              className="seal-trigger"
              type="button"
              aria-label="Mở lá thư"
            >
              <span className="seal-halo" aria-hidden="true">
                <span />
                <span />
              </span>
              <span className="wax-seal" aria-hidden="true">
                <span>P</span>
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
        <p className="intro-status" aria-live="polite" />
      </div>

      <div id="app" />
      <LetterEditorBridge />
      <div id="toast-region" className="toast-region" aria-live="polite" />
      <div id="modal-root" />
    </>
  );
}
