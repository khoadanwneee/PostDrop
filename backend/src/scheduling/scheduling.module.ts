import { Module } from '@nestjs/common';
import { QueueInfrastructureModule } from '../queue/queue-infrastructure.module';
import { OutboxRelayService } from './outbox-relay.service';
import { SchedulingRepository } from './scheduling.repository';
import { SchedulingRuntimeService } from './scheduling-runtime.service';
import { LetterReleaseProcessor } from './letter-release.processor';

@Module({
  imports: [QueueInfrastructureModule],
  providers: [
    SchedulingRepository,
    OutboxRelayService,
    SchedulingRuntimeService,
    LetterReleaseProcessor,
  ],
})
export class SchedulingModule {}
