interface Environment {
  PORT?: string;
  CORS_ORIGIN?: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  LETTER_ENCRYPTION_KEY: string;
  GMAIL_CLIENT_ID?: string;
  GMAIL_CLIENT_SECRET?: string;
  GMAIL_REFRESH_TOKEN?: string;
  GMAIL_SENDER_EMAIL?: string;
  GMAIL_SENDER_NAME?: string;
  GMAIL_OAUTH_PORT?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_USERNAME?: string;
  REDIS_PASSWORD?: string;
  REDIS_TLS?: string;
  WORKER_ID?: string;
  SCHEDULER_BATCH_SIZE?: string;
  SCHEDULER_POLL_INTERVAL_MS?: string;
  OUTBOX_POLL_INTERVAL_MS?: string;
  RECONCILIATION_INTERVAL_MS?: string;
  SCHEDULER_LOCK_TIMEOUT_SECONDS?: string;
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

  const positiveIntegerKeys = [
    'REDIS_PORT',
    'SCHEDULER_BATCH_SIZE',
    'SCHEDULER_POLL_INTERVAL_MS',
    'OUTBOX_POLL_INTERVAL_MS',
    'RECONCILIATION_INTERVAL_MS',
    'SCHEDULER_LOCK_TIMEOUT_SECONDS',
    'GMAIL_OAUTH_PORT',
  ];
  for (const key of positiveIntegerKeys) {
    if (config[key] === undefined || config[key] === '') {
      continue;
    }
    const value = Number(config[key]);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${key} must be a positive integer`);
    }
  }

  if (
    config.REDIS_TLS !== undefined &&
    !['true', 'false'].includes(String(config.REDIS_TLS))
  ) {
    throw new Error('REDIS_TLS must be true or false');
  }

  const gmailKeys = [
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET',
    'GMAIL_REFRESH_TOKEN',
    'GMAIL_SENDER_EMAIL',
  ] as const;
  const configuredGmailKeys = gmailKeys.filter(
    (key) => typeof config[key] === 'string' && config[key].length > 0,
  );
  if (
    configuredGmailKeys.length > 0 &&
    configuredGmailKeys.length !== gmailKeys.length
  ) {
    throw new Error(
      'GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_SENDER_EMAIL must be configured together',
    );
  }

  return config as unknown as Environment;
}
