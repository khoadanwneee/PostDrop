import { Module } from '@nestjs/common';
import { QueueInfrastructureModule } from '../queue/queue-infrastructure.module';
import { OutboxRelayService } from './outbox-relay.service';
import { SchedulingRepository } from './scheduling.repository';
import { SchedulingRuntimeService } from './scheduling-runtime.service';
import { LetterReleaseProcessor } from './letter-release.processor';
import { EmailModule } from '../email/email.module';
import { EmailNotificationProcessor } from './email-notification.processor';
import { RevealModule } from '../reveal/reveal.module';

@Module({
  imports: [QueueInfrastructureModule, EmailModule, RevealModule],
  providers: [
    SchedulingRepository,
    OutboxRelayService,
    SchedulingRuntimeService,
    LetterReleaseProcessor,
    EmailNotificationProcessor,
  ],
})
export class SchedulingModule {}
