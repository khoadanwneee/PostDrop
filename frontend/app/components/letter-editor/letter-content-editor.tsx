'use client';

import type { CSSProperties, PointerEventHandler } from 'react';
import type { CanvasSize, LetterFont, SafeArea } from '@/app/types/letter-editor';
import { toPixelRect } from '@/app/lib/letter-editor/coordinates';

interface LetterContentEditorProps {
  safeArea: SafeArea;
  canvasSize: CanvasSize;
  title: string;
  content: string;
  letterFont: LetterFont;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
}

export function LetterContentEditor({
  safeArea,
  canvasSize,
  title,
  content,
  letterFont,
  onTitleChange,
  onContentChange,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: LetterContentEditorProps) {
  const pixel = toPixelRect(safeArea, canvasSize);
  const style = {
    '--safe-x': `${pixel.x}px`,
    '--safe-y': `${pixel.y}px`,
    '--safe-width': `${pixel.width}px`,
    '--safe-height': `${pixel.height}px`,
  } as CSSProperties;

  return (
    <div
      className={`letter-content-editor font-${letterFont}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onDragOver={(event) => {
        const types = Array.from(event.dataTransfer.types);
        if (
          types.includes('application/x-letter-sticker') ||
          types.includes('Files') ||
          types.includes('text/uri-list')
        ) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'none';
        }
      }}
      onDrop={(event) => {
        const types = Array.from(event.dataTransfer.types);
        if (
          types.includes('application/x-letter-sticker') ||
          types.includes('Files') ||
          types.includes('text/uri-list')
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <label className="sr-only" htmlFor="canvas-letter-title">
        Tiêu đề lá thư
      </label>
      <input
        id="canvas-letter-title"
        className="letter-content-title"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Gửi mình của ngày mai…"
        maxLength={200}
      />
      <label className="sr-only" htmlFor="canvas-letter-content">
        Nội dung lá thư
      </label>
      <textarea
        id="canvas-letter-content"
        className="letter-content-textarea"
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Hãy viết điều bạn muốn thời gian mang đi…"
        maxLength={50000}
      />
      <span className="letter-content-count">{content.length} ký tự</span>
    </div>
  );
}
