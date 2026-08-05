import { ConfigService } from '@nestjs/config';
import { RevealTokenService } from './reveal-token.service';

describe('RevealTokenService', () => {
  const letterId = '22222222-2222-4222-8222-222222222222';
  const createService = (secretByte = 7) =>
    new RevealTokenService(
      new ConfigService({
        REVEAL_TOKEN_SECRET: Buffer.alloc(32, secretByte).toString('base64'),
        PUBLIC_APP_URL: 'https://postdrop.example/app',
      }),
    );

  it('derives one stable high-entropy capability per letter', () => {
    const service = createService();
    const first = service.capabilityToken(letterId);
    const replay = service.capabilityToken(letterId);

    expect(first).toBe(replay);
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(service.hash(first)).toMatch(/^[0-9a-f]{64}$/);
    expect(createService(8).capabilityToken(letterId)).not.toBe(first);
  });

  it('puts the capability in the URL fragment rather than the query string', () => {
    const service = createService();
    const url = new URL(service.revealUrl(letterId));

    expect(url.pathname).toBe(`/app/reveal/${letterId}`);
    expect(url.search).toBe('');
    expect(url.hash).toBe(
      `#token=${service.capabilityToken(letterId)}`,
    );
  });

  it('creates random short-lived reveal sessions', () => {
    const service = createService();
    expect(service.createSessionToken()).not.toBe(service.createSessionToken());
    const now = new Date('2026-07-29T00:00:00.000Z');
    expect(service.sessionExpiresAt(now)).toBe('2026-07-29T00:30:00.000Z');
    expect(service.capabilityExpiresAt(now)).toBe('2026-08-28T00:00:00.000Z');
  });
});
