import { ConfigService } from '@nestjs/config';
import { hostname } from 'os';

export interface SchedulingRuntimeConfig {
  workerId: string;
  batchSize: number;
  schedulerPollIntervalMs: number;
  outboxPollIntervalMs: number;
  reconciliationIntervalMs: number;
  schedulerLockTimeoutSeconds: number;
}

function positiveInteger(
  config: ConfigService,
  key: string,
  fallback: number,
): number {
  const value = Number(config.get<string>(key) || fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
  return value;
}

export function schedulingRuntimeConfig(
  config: ConfigService,
): SchedulingRuntimeConfig {
  const configuredWorkerId = config.get<string>('WORKER_ID')?.trim();
  return {
    workerId: configuredWorkerId || `${hostname()}:${process.pid}`,
    batchSize: Math.min(
      positiveInteger(config, 'SCHEDULER_BATCH_SIZE', 50),
      500,
    ),
    schedulerPollIntervalMs: positiveInteger(
      config,
      'SCHEDULER_POLL_INTERVAL_MS',
      5000,
    ),
    outboxPollIntervalMs: positiveInteger(
      config,
      'OUTBOX_POLL_INTERVAL_MS',
      1000,
    ),
    reconciliationIntervalMs: positiveInteger(
      config,
      'RECONCILIATION_INTERVAL_MS',
      60000,
    ),
    schedulerLockTimeoutSeconds: positiveInteger(
      config,
      'SCHEDULER_LOCK_TIMEOUT_SECONDS',
      900,
    ),
  };
}
