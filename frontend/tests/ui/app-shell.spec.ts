import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('authenticated app shell', () => {
  const appScript = readFileSync(
    join(__dirname, '..', '..', 'public', 'app.js'),
    'utf8',
  );
  const styles = readFileSync(
    join(__dirname, '..', '..', 'public', 'styles.css'),
    'utf8',
  );

  it('loads profile identity from the authenticated user instead of fixed copy', () => {
    expect(appScript).toContain("apiFetch('/api/auth/me')");
    expect(appScript).toContain('user_metadata?.full_name');
    expect(appScript).toContain('data-user-avatar');
    expect(appScript).not.toContain('Tài khoản Minh Anh');
    expect(appScript).not.toContain('Khách hàng PostDrop');
  });

  it('renders an accessible bell icon and balanced app panels', () => {
    expect(appScript).toContain("bell: '<path");
    expect(appScript).toContain('aria-label="Thông báo"');
    expect(appScript).toContain('profile-modal');
    expect(appScript).toContain('step-one-panel');
    expect(styles).toContain('.profile-summary');
    expect(styles).toContain('.step-one-panel');
    expect(styles).toContain('.app-header-actions > .button, .app-header-actions > .icon-button, .app-header-actions > .avatar { height: 42px; min-height: 42px; }');
  });

  it('offers handwritten pickup without resetting the selected letter type', () => {
    expect(appScript).toContain("typeCard('handwritten','mail','Gửi thư bạn viết tay'");
    expect(appScript).toContain("if (draft.letterType === 'handwritten') draft.deliveryMethod = 'physical'");
    expect(appScript.indexOf('draft.letterType = card.dataset.type')).toBeLessThan(appScript.indexOf("draft.letterType === 'handwritten' && !requireLoginForHandwritten"));
    expect(appScript).toContain("draft.letterType === 'handwritten' ? 'stored_original' : 'print_design'");
    expect(appScript).not.toContain("draft.letterType = 'online';\n  if (step >= 3");
  });

  it('leaves camera ownership to the React video step', () => {
    expect(appScript).not.toContain('bindVideoStep();');
    expect(appScript).not.toContain('Loading video recorder');
    expect(appScript).not.toContain('Loading paper options');
  });

  it('keeps paper selection on step 2 until Continue is pressed', () => {
    expect(appScript).not.toContain("draft.lastStep = 3;\n  flushPersistDraft();\n  location.hash = '/create/3';");
    expect(appScript).toContain("document.querySelector('[data-next]')?.addEventListener('click', () => nextStep(step))");
  });

  it('defaults new builder drafts to portrait without skipping step 2', () => {
    expect(appScript).toContain("paperOrientation: 'portrait', selectedThemeId: 'none-portrait'");
    expect(appScript).not.toContain('step === 1 && draft.paperOrientation ? 3 : step + 1');
    expect(appScript).toContain("location.hash = `/create/${step + 1}`");
  });

  it('validates delivery dates inline and hides physical fields for email', () => {
    expect(appScript).toContain('validateDeliveryDate(control.value)');
    expect(appScript).toContain("'Ngày nhận cần nằm trong tương lai.'");
    expect(appScript).toContain("if (draft.deliveryMethod === 'email') return ''");
    expect(appScript).toContain("address: deliveryMethod === 'physical'");
    expect(appScript).toContain("note: deliveryMethod === 'physical'");
  });
});
