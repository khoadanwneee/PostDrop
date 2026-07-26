'use client';

import { PAPER_CONFIGS, PAPER_ORIENTATIONS } from '@/app/config/paper-configs';
import type { PaperOrientation } from '@/app/types/letter-editor';

interface PaperOrientationSelectorProps {
  currentOrientation?: PaperOrientation | null;
  onSelect: (orientation: PaperOrientation) => void;
  compact?: boolean;
}

export function PaperOrientationSelector({
  currentOrientation = null,
  onSelect,
  compact = false,
}: PaperOrientationSelectorProps) {
  return (
    <section
      className={`paper-orientation-selector${compact ? ' is-compact' : ''}`}
      aria-labelledby="paper-orientation-title"
    >
      <header className="paper-orientation-heading">
        <span className="editor-panel-kicker">Bước chọn khổ giấy</span>
        <h2 id="paper-orientation-title">
          Bạn muốn viết thư với loại giấy nào?
        </h2>
        <p>
          Bạn vẫn có thể đổi loại giấy sau trong trình chỉnh sửa.
        </p>
      </header>
      <div className="paper-orientation-grid">
        {PAPER_ORIENTATIONS.map((orientation, index) => {
          const config = PAPER_CONFIGS[orientation];
          const active = currentOrientation === orientation;
          return (
            <button
              key={orientation}
              type="button"
              className={`paper-orientation-card orientation-${orientation}${active ? ' is-current' : ''}`}
              onClick={() => onSelect(orientation)}
              aria-label={`${config.label}. ${config.description} Tỷ lệ ${config.width} × ${config.height}.`}
              aria-pressed={active}
              autoFocus={compact && index === 0}
              data-paper-orientation={orientation}
            >
              <span
                className="paper-orientation-preview"
                style={{ aspectRatio: String(config.aspectRatio) }}
                aria-hidden="true"
              >
                <span className="paper-preview-moon" />
                <span className="paper-preview-lines" />
                <span className="paper-preview-flower" />
              </span>
              <span className="paper-orientation-copy">
                <span className="paper-orientation-title-row">
                  <strong>{config.label}</strong>
                  <span className="paper-orientation-size">
                    {config.width} × {config.height}
                  </span>
                </span>
                <small>{config.description}</small>
                <span className="paper-orientation-action">
                  {active ? '✓ Đang sử dụng' : 'Chọn loại giấy này →'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
