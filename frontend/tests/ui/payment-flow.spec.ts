import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('paid sealing flow', () => {
  const appScript = readFileSync(
    join(__dirname, '..', '..', 'public', 'app.js'),
    'utf8',
  );
  const checkoutPage = readFileSync(
    join(__dirname, '..', '..', 'app', 'checkout', 'page.tsx'),
    'utf8',
  );
  const resultPage = readFileSync(
    join(__dirname, '..', '..', 'app', 'payment-result', 'page.tsx'),
    'utf8',
  );

  it('creates a checkout instead of calling the removed direct seal route', () => {
    expect(appScript).toContain("apiFetch('/api/payments/checkout'");
    expect(appScript).not.toMatch(/apiFetch\(`\/api\/letters\/\$\{created\.id\}\/seal`/);
  });

  it('provides hosted checkout and payment-result pages', () => {
    expect(checkoutPage).toContain('/api/mock-payments/');
    expect(checkoutPage).toContain("submit('complete')");
    expect(resultPage).toContain("result.status === 'succeeded'");
  });

  it('keeps failed-payment drafts reusable and clears them after success', () => {
    expect(appScript).toContain("localStorage.getItem('postdrop-pending-letter-id')");
    expect(resultPage).toContain("localStorage.removeItem('postdrop-pending-letter-id')");
    expect(resultPage).toContain("localStorage.removeItem('postdrop-draft')");
  });
});
