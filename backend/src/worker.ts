import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  Logger.log(
    'PostDrop scheduler and BullMQ outbox relay are running',
    'WorkerBootstrap',
  );
}

void bootstrap();
