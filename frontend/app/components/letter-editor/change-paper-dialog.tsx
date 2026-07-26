'use client';

import { useEffect, useState } from 'react';
import { PAPER_CONFIGS } from '@/app/config/paper-configs';
import type { PaperOrientation } from '@/app/types/letter-editor';
import { PaperOrientationSelector } from './paper-orientation-selector';

interface ChangePaperDialogProps {
  open: boolean;
  currentOrientation: PaperOrientation;
  requiresConfirmation: boolean;
  onCancel: () => void;
  onConfirm: (orientation: PaperOrientation) => void;
}

export function ChangePaperDialog({
  open,
  currentOrientation,
  requiresConfirmation,
  onCancel,
  onConfirm,
}: ChangePaperDialogProps) {
  const [targetOrientation, setTargetOrientation] =
    useState<PaperOrientation | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTargetOrientation(null);
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  const cancelChange = () => {
    setTargetOrientation(null);
    onCancel();
  };

  const confirmChange = (orientation: PaperOrientation) => {
    setTargetOrientation(null);
    onConfirm(orientation);
  };

  const handleSelect = (orientation: PaperOrientation) => {
    if (orientation === currentOrientation) {
      cancelChange();
      return;
    }
    if (requiresConfirmation) {
      setTargetOrientation(orientation);
      return;
    }
    confirmChange(orientation);
  };

  return (
    <div className="paper-dialog-backdrop" role="presentation">
      <div
        className="paper-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          targetOrientation
            ? 'change-paper-confirm-title'
            : 'paper-orientation-title'
        }
      >
        {targetOrientation ? (
          <div
            className={`change-paper-confirmation from-${currentOrientation} to-${targetOrientation}`}
          >
            <div className="change-paper-letterhead" aria-hidden="true">
              <span>POSTDROP</span>
              <i />
              <span>PAPER EDITION</span>
            </div>
            <div className="change-paper-icon" aria-hidden="true">
              <span
                className={`paper-swap-sheet orientation-${currentOrientation}`}
              />
              <span className="paper-swap-arrow">→</span>
              <span
                className={`paper-swap-sheet orientation-${targetOrientation}`}
              />
              <span className="paper-swap-seal">P</span>
            </div>
            <span className="change-paper-kicker">Xác nhận đổi khổ giấy</span>
            <h2 id="change-paper-confirm-title">
              Bạn muốn đổi loại giấy?
            </h2>
            <p>
              Nội dung thư sẽ được giữ lại, nhưng vị trí các element trang trí
              có thể được tự động điều chỉnh để phù hợp với kích thước giấy mới.
            </p>
            <div className="change-paper-summary" aria-live="polite">
              <span className="change-paper-summary-card">
                <small>Đang sử dụng</small>
                <strong>{PAPER_CONFIGS[currentOrientation].label}</strong>
              </span>
              <span className="change-paper-summary-arrow" aria-hidden="true">
                →
              </span>
              <span className="change-paper-summary-card is-next">
                <small>Sẽ chuyển sang</small>
                <strong>{PAPER_CONFIGS[targetOrientation].label}</strong>
              </span>
            </div>
            <div className="paper-dialog-actions">
              <button
                type="button"
                className="paper-dialog-action paper-dialog-action-cancel"
                onClick={cancelChange}
                aria-label="Hủy đổi loại giấy"
              >
                <span className="paper-dialog-action-mark" aria-hidden="true">
                  ×
                </span>
                <span className="paper-dialog-action-copy">
                  <strong>Hủy</strong>
                  <small>Giữ loại giấy hiện tại</small>
                </span>
              </button>
              <button
                type="button"
                className="paper-dialog-action paper-dialog-action-confirm"
                onClick={() => confirmChange(targetOrientation)}
                autoFocus
              >
                <span className="paper-dialog-action-seal" aria-hidden="true">
                  P
                </span>
                <span className="paper-dialog-action-copy">
                  <strong>Đổi loại giấy</strong>
                  <small>Nội dung vẫn được giữ</small>
                </span>
                <span className="paper-dialog-action-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="paper-dialog-close"
              onClick={cancelChange}
              aria-label="Đóng hộp thoại đổi loại giấy"
            >
              ×
            </button>
            <PaperOrientationSelector
              currentOrientation={currentOrientation}
              onSelect={handleSelect}
              compact
            />
          </>
        )}
      </div>
    </div>
  );
}
