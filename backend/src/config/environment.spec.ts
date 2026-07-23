import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  const valid = {
    SUPABASE_URL: 'http://127.0.0.1:54321',
    SUPABASE_PUBLISHABLE_KEY: 'test-key',
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

  it('rejects an invalid encryption key length', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        LETTER_ENCRYPTION_KEY: Buffer.alloc(16).toString('base64'),
      }),
    ).toThrow('base64-encoded 32-byte key');
  });
});
