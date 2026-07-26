'use client';

import NextImage from 'next/image';
import { PAPER_CONFIGS } from '@/app/config/paper-configs';
import { getThemesForOrientation } from '@/app/data/letter-themes';
import type {
  PaperOrientation,
  ThemeElement,
} from '@/app/types/letter-editor';

interface ThemeSidebarProps {
  orientation: PaperOrientation;
  selectedThemeId: string;
  onSelect: (themeId: string) => void;
  onChangeOrientation: () => void;
}

function ThemeThumbnailElement({ element }: { element: ThemeElement }) {
  const placementStyle = {
    left: element.x * 100 + '%',
    top: element.y * 100 + '%',
    width: element.width * 100 + '%',
    height: element.height * 100 + '%',
    zIndex: element.zIndex,
    transform: 'rotate(' + element.rotation + 'deg)',
  } as React.CSSProperties;

  if (element.type === 'image' && element.src) {
    return (
      <NextImage
        src={element.src}
        alt=""
        width={64}
        height={64}
        unoptimized
        style={placementStyle}
      />
    );
  }
  if (element.type === 'text') {
    return (
      <span
        className="theme-thumbnail-text"
        style={{
          ...placementStyle,
          color: element.fill,
          fontFamily: element.fontFamily,
          fontWeight: element.fontStyle?.includes('bold') ? 800 : 650,
        }}
      >
        {element.text}
      </span>
    );
  }
  return (
    <span
      className="theme-thumbnail-shape"
      style={{
        ...placementStyle,
        background: element.fill,
        borderColor: element.stroke,
        borderRadius: element.shape === 'circle' ? '50%' : undefined,
        opacity: element.opacity,
      }}
    />
  );
}

export function ThemeSidebar({
  orientation,
  selectedThemeId,
  onSelect,
  onChangeOrientation,
}: ThemeSidebarProps) {
  const themes = getThemesForOrientation(orientation);
  const paper = PAPER_CONFIGS[orientation];

  return (
    <aside className="theme-sidebar" aria-label="Chọn theme cho lá thư">
      <div className="paper-sidebar-summary">
        <span>
          <small>Loại giấy</small>
          <strong>{paper.label}</strong>
        </span>
        <button
          type="button"
          className="paper-change-trigger"
          onClick={onChangeOrientation}
          aria-label={`Thay đổi ${paper.label.toLowerCase()}`}
        >
          <span>Thay đổi</span>
          <span className="paper-change-trigger-mark" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
      <div className="editor-panel-heading">
        <span className="editor-panel-kicker">Theme phù hợp</span>
      </div>
      <div className="theme-sidebar-list">
        {themes.map((theme) => {
          const active = selectedThemeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              className={`editor-theme-card${active ? ' is-active' : ''}`}
              onClick={() => onSelect(theme.id)}
              aria-label={`Dùng theme ${theme.name}`}
              aria-pressed={active}
            >
              <span
                className={
                  'editor-theme-thumbnail texture-' +
                  theme.canvas.texture +
                  ' variant-' +
                  theme.canvas.variant
                }
                style={{
                  '--theme-background': theme.canvas.backgroundColor,
                  '--theme-accent': theme.canvas.accent,
                  '--theme-ratio': paper.aspectRatio,
                } as React.CSSProperties}
                aria-hidden="true"
              >
                <NextImage
                  className="theme-thumbnail-artwork"
                  src={theme.thumbnail}
                  alt=""
                  width={120}
                  height={Math.round(120 / paper.aspectRatio)}
                  unoptimized
                />
                <span
                  className="theme-thumbnail-safe"
                  style={{
                    left: theme.safeArea.x * 100 + '%',
                    top: theme.safeArea.y * 100 + '%',
                    width: theme.safeArea.width * 100 + '%',
                    height: theme.safeArea.height * 100 + '%',
                  }}
                />
                {theme.defaultElements.map((element) => (
                  <ThemeThumbnailElement key={element.id} element={element} />
                ))}
              </span>
              <span className="editor-theme-state" aria-hidden="true">
                {active ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
