import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { ConnectionOptions } from 'bullmq';
import {
  DELIVERY_QUEUE,
  DOCUMENTS_QUEUE,
  FULFILLMENT_QUEUE,
  NOTIFICATIONS_QUEUE,
} from './queue.constants';

function optionalValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function redisConnection(config: ConfigService): ConnectionOptions {
  const configuredUrl = optionalValue(config.get<string>('REDIS_URL'));
  if (configuredUrl) {
    const url = new URL(configuredUrl);
    const database = url.pathname.slice(1);
    return {
      host: url.hostname,
      port: Number(url.port || 6379),
      username: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      db: database ? Number(database) : undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  }

  return {
    host: config.get<string>('REDIS_HOST') || '127.0.0.1',
    port: Number(config.get<string>('REDIS_PORT') || 6379),
    username: optionalValue(config.get<string>('REDIS_USERNAME')),
    password: optionalValue(config.get<string>('REDIS_PASSWORD')),
    tls: config.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: redisConnection(config),
      }),
    }),
    BullModule.registerQueue(
      {
        name: DELIVERY_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { age: 86400, count: 1000 },
          removeOnFail: { age: 604800, count: 5000 },
        },
      },
      {
        name: NOTIFICATIONS_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { age: 86400, count: 1000 },
          removeOnFail: { age: 604800, count: 5000 },
        },
      },
      {
        name: DOCUMENTS_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 10000 },
          removeOnComplete: { age: 86400, count: 1000 },
          removeOnFail: { age: 604800, count: 5000 },
        },
      },
      {
        name: FULFILLMENT_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 10000 },
          removeOnComplete: { age: 86400, count: 1000 },
          removeOnFail: { age: 604800, count: 5000 },
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueueInfrastructureModule {}
