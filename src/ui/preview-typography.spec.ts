import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('letter preview typography', () => {
  const stylesheet = readFileSync(
    join(__dirname, '..', '..', 'public', 'styles.css'),
    'utf8',
  );

  it('uses a Vietnamese-capable serif stack without Georgia glyph fallback', () => {
    expect(stylesheet).toContain(
      '--serif: "Noto Serif", "Times New Roman", serif;',
    );
    expect(stylesheet).toContain(
      '.letter-preview.font-serif .preview-body { font-family: var(--serif);',
    );
    expect(stylesheet).not.toContain(
      '.letter-preview.font-serif .preview-body { font-family: Georgia',
    );
  });
});
