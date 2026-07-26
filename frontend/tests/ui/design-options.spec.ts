import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('letter design options', () => {
  const appScript = readFileSync(
    join(__dirname, '..', '..', 'public', 'app.js'),
    'utf8',
  );
  const stylesheet = readFileSync(
    join(__dirname, '..', '..', 'public', 'styles.css'),
    'utf8',
  );
  const editorStylesheet = readFileSync(
    join(__dirname, '..', '..', 'public', 'letter-editor.css'),
    'utf8',
  );
  const elementToolbar = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'letter-editor',
      'element-toolbar.tsx',
    ),
    'utf8',
  );
  const changePaperDialog = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'letter-editor',
      'change-paper-dialog.tsx',
    ),
    'utf8',
  );
  const themeSidebar = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'letter-editor',
      'theme-sidebar.tsx',
    ),
    'utf8',
  );
  const letterEditor = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'letter-editor',
      'letter-editor.tsx',
    ),
    'utf8',
  );

  it.each(['ivory', 'rose', 'warm', 'sage', 'lavender', 'sky', 'parchment', 'linen'])(
    'renders the %s paper option and preview style',
    (paper) => {
      expect(appScript).toContain(`['${paper}', 'paper-${paper}'`);
      expect(stylesheet).toContain(`.letter-preview.paper-${paper}`);
    },
  );

  it.each([
    'burgundy',
    'olive',
    'terracotta',
    'navy',
    'forest',
    'plum',
    'dusty-blue',
    'sand',
    'charcoal',
  ])('renders and maps the %s envelope color', (envelope) => {
    expect(appScript).toContain(`['${envelope}', 'envelope-${envelope}'`);
    expect(stylesheet).toContain(`.swatch.envelope-${envelope}`);
  });
  it.each(['cute', 'y2k', 'study', 'scrapbook'])(
    'renders and applies the %s theme around the frame',
    (theme) => {
      expect(appScript).toContain(`{ id: '${theme}'`);
      expect(appScript).toContain(`${theme}: [`);
      expect(stylesheet).toContain(`.theme-card-${theme} .theme-card-preview { background-image: url('/themes/theme-${theme}-full.png'); }`);
      expect(stylesheet).not.toContain(`.letter-preview.theme-${theme} .letter-theme-surface { background-image: url('/themes/theme-${theme}-full.png'); }`);
    },
  );

  it('keeps preset decorations behind a protected text area', () => {
    expect(appScript).toContain('<div class="letter-content">');
    expect(appScript).toContain('<div class="letter-theme-surface" aria-hidden="true"></div>');
    expect(appScript).toContain('class="theme-decoration-layer"');
    expect(appScript).toContain('class="theme-decoration"');
    expect(stylesheet).toContain('.letter-preview.has-theme .theme-decoration-layer');
    expect(stylesheet).toContain('.letter-preview.has-theme .letter-content');
    expect(stylesheet).toContain('background: rgba(255, 253, 248, .94);');
    expect(stylesheet).toContain('z-index: 2;');
  });
  it('moves the letter font picker into the element library', () => {
    expect(appScript).not.toContain('<label>Kiểu chữ trong thư</label>');
    expect(elementToolbar).toContain('className="element-font-picker"');
    expect(elementToolbar).toContain('onFontChange(font.id)');
    expect(editorStylesheet).toContain(
      '.letter-content-editor.font-hand .letter-content-textarea',
    );
  });

  it('keeps swatch names accessible without rendering visible labels', () => {
    expect(appScript).toContain('aria-label="${label}"');
    expect(appScript).toContain('title="${label}"');
    expect(appScript).not.toContain(
      '<span class="swatch-label">${label}</span>',
    );
  });

  it('uses the PostDrop paper-and-seal visual language for paper changes', () => {
    expect(changePaperDialog).toContain('className="change-paper-letterhead"');
    expect(changePaperDialog).toContain('paper-dialog-action-confirm');
    expect(changePaperDialog).toContain('className="paper-dialog-action-seal"');
    expect(themeSidebar).toContain('className="paper-change-trigger"');
    expect(themeSidebar).toContain('className="paper-change-trigger-mark"');
    expect(editorStylesheet).toContain('.paper-swap-seal');
    expect(editorStylesheet).toContain('.paper-dialog-action-confirm');
  });
  it('does not show routine success toasts for design changes', () => {
    expect(letterEditor).not.toContain('Đã đổi theme.');
    expect(letterEditor).not.toContain('Đã đổi kiểu chữ trong thư.');
    expect(letterEditor).not.toContain('Đã chọn ${PAPER_CONFIGS');
    expect(letterEditor).not.toContain('Đã đổi sang ${PAPER_CONFIGS');
    expect(elementToolbar).toContain("type: 'error'");
    expect(appScript).toContain("detail.message && detail.type === 'error'");
  });
});
