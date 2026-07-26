interface Environment {
  PORT?: string;
  CORS_ORIGIN?: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  LETTER_ENCRYPTION_KEY: string;
}

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LETTER_ENCRYPTION_KEY',
  ] as const;

  for (const key of required) {
    if (typeof config[key] !== 'string' || config[key].length === 0) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  const encryptionKey = Buffer.from(config.LETTER_ENCRYPTION_KEY as string, 'base64');
  if (encryptionKey.length !== 32) {
    throw new Error('LETTER_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  }

  return config as unknown as Environment;
}
