import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  const valid = {
    SUPABASE_URL: 'http://127.0.0.1:54321',
    SUPABASE_PUBLISHABLE_KEY: 'test-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    LETTER_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
    REVEAL_TOKEN_SECRET: Buffer.alloc(32, 2).toString('base64'),
    PUBLIC_APP_URL: 'http://localhost:3000',
  };

  it('accepts a complete environment', () => {
    expect(validateEnvironment(valid)).toEqual(valid);
  });

  it('rejects a missing Supabase URL', () => {
    expect(() =>
      validateEnvironment({ ...valid, SUPABASE_URL: '' }),
    ).toThrow('SUPABASE_URL');
  });

  it('rejects a missing service-role key', () => {
    expect(() =>
      validateEnvironment({ ...valid, SUPABASE_SERVICE_ROLE_KEY: '' }),
    ).toThrow('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('rejects an invalid encryption key length', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        LETTER_ENCRYPTION_KEY: Buffer.alloc(16).toString('base64'),
      }),
    ).toThrow('base64-encoded 32-byte key');
  });

  it('rejects an invalid reveal token secret or public app URL', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        REVEAL_TOKEN_SECRET: Buffer.alloc(16).toString('base64'),
      }),
    ).toThrow('REVEAL_TOKEN_SECRET must be a base64-encoded 32-byte key');
    expect(() =>
      validateEnvironment({
        ...valid,
        PUBLIC_APP_URL: 'javascript:alert(1)',
      }),
    ).toThrow('PUBLIC_APP_URL must be an HTTP(S)');
  });

  it('rejects invalid Redis and scheduler configuration', () => {
    expect(() =>
      validateEnvironment({ ...valid, REDIS_PORT: 'not-a-port' }),
    ).toThrow('REDIS_PORT must be a positive integer');
    expect(() =>
      validateEnvironment({ ...valid, SCHEDULER_BATCH_SIZE: '0' }),
    ).toThrow('SCHEDULER_BATCH_SIZE must be a positive integer');
    expect(() =>
      validateEnvironment({ ...valid, REDIS_TLS: 'sometimes' }),
    ).toThrow('REDIS_TLS must be true or false');
    expect(() =>
      validateEnvironment({ ...valid, REDIS_URL: 'https://redis.example.com' }),
    ).toThrow('REDIS_URL must use the redis:// or rediss:// protocol');
  });

  it('accepts a hosted Redis URL', () => {
    expect(
      validateEnvironment({
        ...valid,
        REDIS_URL: 'rediss://user:password@redis.example.com:6380/0',
      }),
    ).toEqual({
      ...valid,
      REDIS_URL: 'rediss://user:password@redis.example.com:6380/0',
    });
  });

  it('accepts complete Gmail OAuth configuration', () => {
    expect(
      validateEnvironment({
        ...valid,
        GMAIL_CLIENT_ID: 'client-id',
        GMAIL_CLIENT_SECRET: 'client-secret',
        GMAIL_REFRESH_TOKEN: 'refresh-token',
        GMAIL_SENDER_EMAIL: 'sender@example.edu',
        GMAIL_SENDER_NAME: 'PostDrop',
        GMAIL_OAUTH_PORT: '53682',
      }),
    ).toEqual({
      ...valid,
      GMAIL_CLIENT_ID: 'client-id',
      GMAIL_CLIENT_SECRET: 'client-secret',
      GMAIL_REFRESH_TOKEN: 'refresh-token',
      GMAIL_SENDER_EMAIL: 'sender@example.edu',
      GMAIL_SENDER_NAME: 'PostDrop',
      GMAIL_OAUTH_PORT: '53682',
    });
  });

  it('rejects partial Gmail configuration', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        GMAIL_CLIENT_ID: 'client-id',
      }),
    ).toThrow('GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET');
  });
});
