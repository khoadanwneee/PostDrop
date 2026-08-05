import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('email-confirmed authentication flow', () => {
  const appScript = readFileSync(
    join(__dirname, '..', '..', 'public', 'app.js'),
    'utf8',
  );

  it('keeps authenticated users out of guest-only auth routes', () => {
    expect(appScript).toContain("apiFetch('/api/auth/me')");
    expect(appScript).toContain("renderGuestOnly(() => renderAuth('login'), hash)");
    expect(appScript).toContain("renderGuestOnly(() => renderAuth('register'), hash)");
    expect(appScript).toContain("replaceHash('/dashboard')");
  });

  it('sends registrations requiring confirmation to the verification screen', () => {
    expect(appScript).toContain('data.emailConfirmationRequired || !data.accessToken');
    expect(appScript).toContain("setPendingVerificationEmail(email)");
    expect(appScript).toContain("location.hash = '/verify'");
  });

  it('verifies by signing in and supports real confirmation resends', () => {
    expect(appScript).toContain("fetch('/api/auth/login'");
    expect(appScript).toContain("fetch('/api/auth/resend-confirmation'");
    expect(appScript).toContain('consumeEmailConfirmationSession()');
    expect(appScript).toContain("toast('Email của bạn chưa được xác nhận.'");
    expect(appScript).not.toContain('href="#/dashboard">Tôi đã xác thực email</a>');
  });
});
