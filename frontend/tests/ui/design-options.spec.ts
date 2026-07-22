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
});
