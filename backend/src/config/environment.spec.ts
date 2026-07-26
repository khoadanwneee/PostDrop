import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  const valid = {
    SUPABASE_URL: 'http://127.0.0.1:54321',
    SUPABASE_PUBLISHABLE_KEY: 'test-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    LETTER_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
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
  });
});
