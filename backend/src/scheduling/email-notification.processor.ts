import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_PROVIDER, EmailProvider } from '../email/email-provider';
import { NOTIFICATIONS_QUEUE } from '../queue/queue.constants';
import { SchedulingRepository } from './scheduling.repository';
import { ScheduledActionJob } from './scheduling.types';
import { RevealTokenService } from '../reveal/reveal-token.service';

@Processor(NOTIFICATIONS_QUEUE)
export class EmailNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailNotificationProcessor.name);

  constructor(
    private readonly repository: SchedulingRepository,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly revealTokens: RevealTokenService,
  ) {
    super();
  }

  async process(job: Job<ScheduledActionJob>): Promise<void> {
    if (
      job.name !== 'send_notification' ||
      job.data.actionType !== 'send_notification'
    ) {
      throw new Error('UNSUPPORTED_NOTIFICATION_JOB');
    }

    const notification = await this.repository.prepareEmailNotification(
      job.data.scheduledActionId,
      job.data.letterId,
    );
    if (!notification.should_send) {
      return;
    }

    const result = await this.emailProvider.sendLetterAvailable({
      to: notification.recipient_email,
      recipientName: notification.recipient_name,
      letterTitle: notification.letter_title,
      idempotencyKey: notification.idempotency_key,
      revealUrl: this.revealTokens.revealUrl(job.data.letterId),
    });

    await this.repository.completeEmailNotification(
      job.data.scheduledActionId,
      notification.attempt_id,
      result.providerMessageId,
    );
    this.logger.log(`Sent letter notification for ${job.data.letterId}`);
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<ScheduledActionJob> | undefined,
    error: Error,
  ): Promise<void> {
    if (!job || job.name !== 'send_notification') {
      return;
    }

    const configuredAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < configuredAttempts) {
      return;
    }

    try {
      const notification = await this.repository.prepareEmailNotification(
        job.data.scheduledActionId,
        job.data.letterId,
      );
      if (!notification.should_send) {
        return;
      }
      await this.repository.failEmailNotification(
        job.data.scheduledActionId,
        notification.attempt_id,
        this.errorCode(error),
      );
    } catch (markError) {
      try {
        await this.repository.markActionFailed(
          job.data.scheduledActionId,
          this.errorCode(error),
        );
      } catch (actionError) {
        this.logger.error(
          `Could not persist email failure for scheduled action ${job.data.scheduledActionId}: ${this.errorCode(markError)}; ${this.errorCode(actionError)}`,
        );
      }
    }
  }

  private errorCode(error: unknown): string {
    return error instanceof Error
      ? error.message.slice(0, 120)
      : 'EMAIL_NOTIFICATION_FAILED';
  }
}
