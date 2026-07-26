import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  DELIVERY_QUEUE,
  DOCUMENTS_QUEUE,
  FULFILLMENT_QUEUE,
  NOTIFICATIONS_QUEUE,
} from '../queue/queue.constants';
import { OutboxRelayService } from './outbox-relay.service';
import { SchedulingRepository } from './scheduling.repository';
import { ClaimedOutboxEvent } from './scheduling.types';

describe('OutboxRelayService', () => {
  let loggerError: jest.SpyInstance;
  const event: ClaimedOutboxEvent = {
    id: '11111111-1111-4111-8111-111111111111',
    scheduled_action_id: '22222222-2222-4222-8222-222222222222',
    dispatch_count: 1,
    queue_name: DELIVERY_QUEUE,
    job_name: 'deliver_email',
    job_id: '22222222-2222-4222-8222-222222222222-1',
    payload: {
      scheduledActionId: '22222222-2222-4222-8222-222222222222',
      letterId: '33333333-3333-4333-8333-333333333333',
      actionType: 'deliver_email',
      idempotencyKey:
        'deliver_email:33333333-3333-4333-8333-333333333333',
      dispatchCount: 1,
    },
    publish_attempt_count: 1,
  };

  const repository = {
    claimOutboxEvents: jest.fn(),
    markPublished: jest.fn(),
    markFailed: jest.fn(),
  } as unknown as SchedulingRepository;
  const delivery = { add: jest.fn() } as unknown as Queue;
  const notifications = { add: jest.fn() } as unknown as Queue;
  const documents = { add: jest.fn() } as unknown as Queue;
  const fulfillment = { add: jest.fn() } as unknown as Queue;
  const relay = new OutboxRelayService(
    repository,
    delivery,
    notifications,
    documents,
    fulfillment,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerError.mockRestore();
  });

  it('publishes with the durable job ID before marking the outbox event', async () => {
    jest
      .mocked(repository.claimOutboxEvents)
      .mockResolvedValue([{ ...event }]);
    jest.mocked(delivery.add).mockResolvedValue({} as never);

    await expect(relay.publishClaimed('worker-1', 50, 300)).resolves.toBe(1);

    expect(delivery.add).toHaveBeenCalledWith(
      'deliver_email',
      event.payload,
      { jobId: event.job_id },
    );
    expect(repository.markPublished).toHaveBeenCalledWith(
      event.id,
      'worker-1',
    );
    expect(repository.markFailed).not.toHaveBeenCalled();
  });

  it('releases the outbox event for retry when Redis publishing fails', async () => {
    jest
      .mocked(repository.claimOutboxEvents)
      .mockResolvedValue([{ ...event }]);
    jest.mocked(delivery.add).mockRejectedValue(new Error('REDIS_UNAVAILABLE'));

    await expect(relay.publishClaimed('worker-1', 50, 300)).resolves.toBe(0);

    expect(repository.markPublished).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      event.id,
      'worker-1',
      'REDIS_UNAVAILABLE',
    );
  });

  it('rejects a payload that does not match the durable job name', async () => {
    jest.mocked(repository.claimOutboxEvents).mockResolvedValue([
      {
        ...event,
        payload: {
          ...event.payload,
          actionType: 'create_print_order',
        },
      },
    ]);

    await expect(relay.publishClaimed('worker-1', 50, 300)).resolves.toBe(0);

    expect(delivery.add).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      event.id,
      'worker-1',
      'OUTBOX_PAYLOAD_JOB_MISMATCH',
    );
  });

  it('rejects a queue that does not match the action routing policy', async () => {
    jest.mocked(repository.claimOutboxEvents).mockResolvedValue([
      {
        ...event,
        queue_name: FULFILLMENT_QUEUE,
      },
    ]);

    await expect(relay.publishClaimed('worker-1', 50, 300)).resolves.toBe(0);

    expect(fulfillment.add).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      event.id,
      'worker-1',
      'OUTBOX_QUEUE_JOB_MISMATCH',
    );
  });

  it('uses all registered queue instances', () => {
    expect([delivery, notifications, documents, fulfillment]).toHaveLength(4);
    expect([
      DELIVERY_QUEUE,
      NOTIFICATIONS_QUEUE,
      DOCUMENTS_QUEUE,
      FULFILLMENT_QUEUE,
    ]).toHaveLength(4);
  });
});
