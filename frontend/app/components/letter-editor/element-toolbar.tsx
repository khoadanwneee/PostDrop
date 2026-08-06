'use client';

import { useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import {
  stickerCategories,
  stickerElements,
} from '@/app/data/sticker-elements';
import {
  LETTER_STICKER_MIME,
  serializeStickerDragPayload,
} from '@/app/lib/letter-editor/drag-payload';
import type {
  LetterFont,
  StickerCategory,
  StickerDefinition,
} from '@/app/types/letter-editor';

const letterFonts: ReadonlyArray<{ id: LetterFont; label: string }> = [
  { id: 'serif', label: 'Editorial' },
  { id: 'modern', label: 'Hiện đại' },
  { id: 'hand', label: 'Viết tay' },
];

interface ElementToolbarProps {
  letterFont: LetterFont;
  onFontChange: (font: LetterFont) => void;
  onAddSticker: (sticker: StickerDefinition) => void;
  onAddText: () => void;
  onAddShape: () => void;
  onAddImage: (src: string, name: string, aspectRatio: number) => void;
}

export function ElementToolbar({
  letterFont,
  onFontChange,
  onAddSticker,
  onAddText,
  onAddShape,
  onAddImage,
}: ElementToolbarProps) {
  const [activeCategory, setActiveCategory] = useState<StickerCategory>('cute');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visibleStickers = useMemo(
    () =>
      stickerElements.filter(
        (sticker) =>
          sticker.category === activeCategory ||
          sticker.src.includes(`/stickers/${activeCategory}/`),
      ),
    [activeCategory],
  );

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!['image/gif', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      window.dispatchEvent(
        new CustomEvent('postdrop-editor-toast', {
          detail: { message: 'Hãy chọn một tệp hình ảnh.', type: 'error' },
        }),
      );
      return;
    }
    if (file.size > 1_500_000) {
      window.dispatchEvent(
        new CustomEvent('postdrop-editor-toast', {
          detail: {
            message: 'Ảnh cần nhỏ hơn 1,5 MB để bản nháp lưu ổn định.',
            type: 'error',
          },
        }),
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const image = new Image();
      image.onload = () =>
        onAddImage(src, file.name, image.naturalWidth / image.naturalHeight);
      image.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="element-toolbar" aria-label="Thư viện thiết kế lá thư">
      <div className="editor-panel-heading">
        <span className="editor-panel-kicker">Thư viện</span>
        <h2>Trang trí</h2>
      </div>
      <div className="element-font-picker">
        <span className="element-font-label">Kiểu chữ trong thư</span>
        <div className="element-font-options" role="group" aria-label="Kiểu chữ trong thư">
          {letterFonts.map((font) => (
            <button
              key={font.id}
              type="button"
              className={`element-font-option font-${font.id}${letterFont === font.id ? ' is-active' : ''}`}
              aria-pressed={letterFont === font.id}
              title={`Dùng kiểu chữ ${font.label}`}
              onClick={() => onFontChange(font.id)}
            >
              <span aria-hidden="true">Aa</span>
              <small>{font.label}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="element-quick-actions">
        <button
          type="button"
          onClick={onAddText}
          aria-label="Thêm chữ trang trí"
          title="Thêm chữ trang trí"
        >
          <span aria-hidden="true">Aa</span>
          Chữ
        </button>
        <button
          type="button"
          onClick={onAddShape}
          aria-label="Thêm hình khối"
          title="Thêm hình khối"
        >
          <span aria-hidden="true">●</span>
          Shape
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Tải ảnh trang trí lên"
          title="Tải ảnh lên"
        >
          <span aria-hidden="true">＋</span>
          Ảnh
        </button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/gif,image/jpeg,image/png,image/webp"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>
      <div
        className="element-kind-tabs"
        role="tablist"
        aria-label="Lọc nhóm sticker"
      >
        {stickerCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={activeCategory === cat.id ? 'is-active' : ''}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="element-library-grid" role="list">
        {visibleStickers.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            role="listitem"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.clearData();
              event.dataTransfer.effectAllowed = 'copy';
              event.dataTransfer.setData(
                LETTER_STICKER_MIME,
                serializeStickerDragPayload(sticker.id),
              );
            }}
            onClick={() => onAddSticker(sticker)}
            aria-label={`Thêm ${sticker.name}`}
            title={`Thêm ${sticker.name}`}
          >
            <NextImage
              src={sticker.src}
              alt=""
              aria-hidden="true"
              draggable={false}
              onError={(event) =>
                event.currentTarget.closest('button')?.classList.add('is-asset-error')
              }
              width={54}
              height={54}
              unoptimized
            />
          </button>
        ))}
        {visibleStickers.length === 0 ? (
          <p className="element-empty-state">Chưa có element trong nhóm này.</p>
        ) : null}
      </div>
    </aside>
  );
}
