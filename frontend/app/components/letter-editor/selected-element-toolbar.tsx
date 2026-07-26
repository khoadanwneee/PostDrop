'use client';

import type { ThemeElement } from '@/app/types/letter-editor';

interface SelectedElementToolbarProps {
  element: ThemeElement | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onReset: () => void;
  onDelete: () => void;
}

export function SelectedElementToolbar({
  element,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDuplicate,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  onReset,
  onDelete,
}: SelectedElementToolbarProps) {
  return (
    <div className="selected-element-toolbar" aria-label="Công cụ chỉnh sửa">
      <div className="editor-history-actions">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Hoàn tác"
          title="Hoàn tác"
        >
          ↶ <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Làm lại"
          title="Làm lại"
        >
          ↷ <span>Redo</span>
        </button>
      </div>
      {element ? (
        <div className="selected-element-actions">
          <span
            className={`selected-element-label${element.locked ? ' is-locked' : ''}`}
          >
            {element.locked ? '🔒 ' : ''}
            {element.alt ?? element.text ?? 'Element đang chọn'}
          </span>
          <button
            type="button"
            onClick={onDuplicate}
            aria-label="Nhân bản element"
            title="Nhân bản"
          >
            ⧉ <span>Nhân bản</span>
          </button>
          <button
            type="button"
            onClick={onToggleLock}
            aria-label={element.locked ? 'Mở khóa element' : 'Khóa element'}
            title={element.locked ? 'Mở khóa' : 'Khóa'}
          >
            {element.locked ? '🔓' : '🔒'}{' '}
            <span>{element.locked ? 'Mở khóa' : 'Khóa'}</span>
          </button>
          <button
            type="button"
            onClick={onMoveUp}
            aria-label="Đưa element lên trên"
            title="Đưa lên trên"
          >
            ↑ <span>Lên</span>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            aria-label="Đưa element xuống dưới"
            title="Đưa xuống dưới"
          >
            ↓ <span>Xuống</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Đặt lại element"
            title="Về vị trí ban đầu"
          >
            ↺ <span>Đặt lại</span>
          </button>
          <button
            type="button"
            className="is-danger"
            onClick={onDelete}
            disabled={element.locked}
            aria-label="Xóa element"
            title={element.locked ? 'Mở khóa trước khi xóa' : 'Xóa'}
          >
            × <span>Xóa</span>
          </button>
        </div>
      ) : (
        <p className="selected-element-hint">
        </p>
      )}
    </div>
  );
}
