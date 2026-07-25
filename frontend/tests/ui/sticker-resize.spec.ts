import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('sticker zoom and resize controls', () => {
  const appScript = readFileSync(
    join(__dirname, '..', '..', 'public', 'app.js'),
    'utf8',
  );
  const stylesheet = readFileSync(
    join(__dirname, '..', '..', 'public', 'styles.css'),
    'utf8',
  );

  it('renders a proportional resize handle on every corner', () => {
    expect(appScript).toContain('data-resize-corner="${corner}"');
    for (const corner of ['nw', 'ne', 'sw', 'se']) {
      expect(stylesheet).toContain(`.resize-handle-${corner}`);
    }
  });

  it('uses pointer events so resizing works with mouse, pen, and touch', () => {
    expect(appScript).toContain("handle.addEventListener('pointerdown'");
    expect(appScript).toContain("window.addEventListener('pointermove'");
    expect(appScript).toContain("window.addEventListener('pointerup'");
    expect(stylesheet).toContain('touch-action: none;');
  });

  it('keeps the control UI at a fixed size while the sticker dimensions change', () => {
    expect(appScript).toContain('width: ${size}px; height: ${size}px;');
    expect(appScript).not.toContain('transform: translate(-50%, -50%) scale(${scale});');
    expect(stylesheet).toContain('transform: translate(-50%, -50%);');
    expect(stylesheet).toContain('.scale-value');
  });

  it('keeps zoom inside the supported 40% to 300% range', () => {
    expect(appScript).toContain('const DECORATION_MIN_SCALE = 0.4;');
    expect(appScript).toContain('const DECORATION_MAX_SCALE = 3;');
    expect(appScript).toContain('roundedDecorationScale');
  });
});
