import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DELIVERY_QUEUE } from '../queue/queue.constants';
import { ScheduledActionJob } from './scheduling.types';
import { SchedulingRepository } from './scheduling.repository';

@Processor(DELIVERY_QUEUE)
export class LetterReleaseProcessor extends WorkerHost {
  private readonly logger = new Logger(LetterReleaseProcessor.name);

  constructor(private readonly repository: SchedulingRepository) {
    super();
  }

  async process(job: Job<ScheduledActionJob>): Promise<void> {
    if (
      job.name !== 'release_letter' ||
      job.data.actionType !== 'release_letter'
    ) {
      throw new Error('UNSUPPORTED_DELIVERY_JOB');
    }

    const newlyReleased = await this.repository.completeLetterRelease(
      job.data.scheduledActionId,
      job.data.letterId,
    );

    if (newlyReleased) {
      this.logger.log(`Released digital letter ${job.data.letterId}`);
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<ScheduledActionJob> | undefined,
    error: Error,
  ): Promise<void> {
    if (!job || job.name !== 'release_letter') {
      return;
    }

    const configuredAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < configuredAttempts) {
      return;
    }

    try {
      await this.repository.markActionFailed(
        job.data.scheduledActionId,
        this.errorCode(error),
      );
    } catch (markError) {
      this.logger.error(
        `Could not persist failure for scheduled action ${job.data.scheduledActionId}: ${this.errorCode(markError)}`,
      );
    }
  }

  private errorCode(error: unknown): string {
    return error instanceof Error
      ? error.message.slice(0, 120)
      : 'LETTER_RELEASE_FAILED';
  }
}
