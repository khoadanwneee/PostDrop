import { ConfigService } from '@nestjs/config';
import { redisConnection } from './queue-infrastructure.module';

describe('redisConnection', () => {
  it('uses a hosted REDIS_URL including credentials, TLS, and database', () => {
    const connection = redisConnection(
      new ConfigService({
        REDIS_URL: 'rediss://queue-user:p%40ss@redis.example.com:6380/2',
      }),
    );

    expect(connection).toMatchObject({
      host: 'redis.example.com',
      port: 6380,
      username: 'queue-user',
      password: 'p@ss',
      db: 2,
      tls: {},
      maxRetriesPerRequest: null,
    });
  });

  it('falls back to individual local Redis settings', () => {
    const connection = redisConnection(
      new ConfigService({ REDIS_HOST: '127.0.0.1', REDIS_PORT: '6379' }),
    );

    expect(connection).toMatchObject({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null,
    });
  });
});
