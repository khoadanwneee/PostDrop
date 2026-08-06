import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('reproducible letter design persistence', () => {
  const appScript = readFileSync(
    join(__dirname, '..', '..', 'public', 'app.js'),
    'utf8',
  );
  const editor = readFileSync(
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

  it('captures the complete normalized canvas in a versioned snapshot', () => {
    expect(editor).toContain('schemaVersion: 1');
    expect(editor).toContain('elements: elements.map');
    expect(editor).toContain('canvas: { ...snapshotTheme.canvas }');
    expect(editor).toContain('safeArea: { ...snapshotTheme.safeArea }');
  });

  it('sends the snapshot with the letter and promotes embedded images to attachments', () => {
    expect(appScript).toContain(
      'presentationSnapshot: preparePresentationSnapshot(draft.designSnapshot)',
    );
    expect(appScript).toContain('syncDesignImageAttachments(created.id');
    expect(appScript).toContain('next.attachmentClientId =');
    expect(appScript).toContain('role: "decoration"');
  });
});
