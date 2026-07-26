import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  DELIVERY_QUEUE,
  DOCUMENTS_QUEUE,
  FULFILLMENT_QUEUE,
  NOTIFICATIONS_QUEUE,
  PostDropQueueName,
} from '../queue/queue.constants';
import { queueForAction } from '../queue/queue-routing';
import { SchedulingRepository } from './scheduling.repository';
import { ClaimedOutboxEvent } from './scheduling.types';

@Injectable()
export class OutboxRelayService {
  private readonly logger = new Logger(OutboxRelayService.name);
  private readonly queues: Map<PostDropQueueName, Queue>;

  constructor(
    private readonly repository: SchedulingRepository,
    @InjectQueue(DELIVERY_QUEUE) deliveryQueue: Queue,
    @InjectQueue(NOTIFICATIONS_QUEUE) notificationsQueue: Queue,
    @InjectQueue(DOCUMENTS_QUEUE) documentsQueue: Queue,
    @InjectQueue(FULFILLMENT_QUEUE) fulfillmentQueue: Queue,
  ) {
    this.queues = new Map([
      [DELIVERY_QUEUE, deliveryQueue],
      [NOTIFICATIONS_QUEUE, notificationsQueue],
      [DOCUMENTS_QUEUE, documentsQueue],
      [FULFILLMENT_QUEUE, fulfillmentQueue],
    ]);
  }

  async publishClaimed(
    workerId: string,
    limit: number,
    lockTimeoutSeconds: number,
  ): Promise<number> {
    const events = await this.repository.claimOutboxEvents(
      workerId,
      limit,
      lockTimeoutSeconds,
    );
    let published = 0;

    for (const event of events) {
      try {
        await this.publish(event);
        await this.repository.markPublished(event.id, workerId);
        published += 1;
      } catch (error) {
        const errorCode = this.errorCode(error);
        this.logger.error(
          `Failed to publish outbox event ${event.id}: ${errorCode}`,
        );
        await this.repository.markFailed(event.id, workerId, errorCode);
      }
    }

    return published;
  }

  private async publish(event: ClaimedOutboxEvent): Promise<void> {
    const queue = this.queues.get(event.queue_name);
    if (!queue) {
      throw new Error(`UNSUPPORTED_QUEUE_${event.queue_name}`);
    }
    if (event.payload.actionType !== event.job_name) {
      throw new Error('OUTBOX_PAYLOAD_JOB_MISMATCH');
    }
    if (queueForAction(event.job_name) !== event.queue_name) {
      throw new Error('OUTBOX_QUEUE_JOB_MISMATCH');
    }

    await queue.add(event.job_name, event.payload, {
      jobId: event.job_id,
    });
  }

  private errorCode(error: unknown): string {
    if (error instanceof Error) {
      return error.message.slice(0, 120);
    }
    return 'QUEUE_PUBLISH_FAILED';
  }
}
