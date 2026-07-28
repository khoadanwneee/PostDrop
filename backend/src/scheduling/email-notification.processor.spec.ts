import { Job } from 'bullmq';
import { EmailProvider } from '../email/email-provider';
import { EmailNotificationProcessor } from './email-notification.processor';
import { SchedulingRepository } from './scheduling.repository';
import { ScheduledActionJob } from './scheduling.types';

describe('EmailNotificationProcessor', () => {
  const repository = {
    prepareEmailNotification: jest.fn(),
    completeEmailNotification: jest.fn(),
    failEmailNotification: jest.fn(),
    markActionFailed: jest.fn(),
  } as unknown as SchedulingRepository;
  const provider = {
    sendLetterAvailable: jest.fn(),
  } as unknown as EmailProvider;
  const processor = new EmailNotificationProcessor(repository, provider);
  const data: ScheduledActionJob = {
    scheduledActionId: '11111111-1111-4111-8111-111111111111',
    letterId: '22222222-2222-4222-8222-222222222222',
    actionType: 'send_notification',
    idempotencyKey: 'send_notification:22222222-2222-4222-8222-222222222222',
    dispatchCount: 1,
  };
  const prepared = {
    should_send: true,
    attempt_id: '33333333-3333-4333-8333-333333333333',
    recipient_email: 'recipient@example.com',
    recipient_name: 'Recipient',
    letter_title: 'Future letter',
    idempotency_key: data.idempotencyKey,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends and atomically records the provider message ID', async () => {
    jest
      .mocked(repository.prepareEmailNotification)
      .mockResolvedValue(prepared);
    jest.mocked(provider.sendLetterAvailable).mockResolvedValue({
      providerMessageId: 'gmail-message-id',
    });

    await processor.process({
      name: 'send_notification',
      data,
    } as Job<ScheduledActionJob>);

    expect(provider.sendLetterAvailable).toHaveBeenCalledWith({
      to: prepared.recipient_email,
      recipientName: prepared.recipient_name,
      letterTitle: prepared.letter_title,
      idempotencyKey: data.idempotencyKey,
    });
    expect(repository.prepareEmailNotification).toHaveBeenCalledWith(
      data.scheduledActionId,
      data.letterId,
    );
    expect(repository.completeEmailNotification).toHaveBeenCalledWith(
      data.scheduledActionId,
      prepared.attempt_id,
      'gmail-message-id',
    );
  });

  it('does not call Gmail after a send has already been recorded', async () => {
    jest.mocked(repository.prepareEmailNotification).mockResolvedValue({
      ...prepared,
      should_send: false,
    });

    await processor.process({
      name: 'send_notification',
      data,
    } as Job<ScheduledActionJob>);

    expect(provider.sendLetterAvailable).not.toHaveBeenCalled();
  });

  it('records terminal failures after BullMQ exhausts retries', async () => {
    jest
      .mocked(repository.prepareEmailNotification)
      .mockResolvedValue(prepared);
    const job = {
      name: 'send_notification',
      data,
      attemptsMade: 5,
      opts: { attempts: 5 },
    } as Job<ScheduledActionJob>;

    await processor.onFailed(job, new Error('rate_limit_exceeded'));

    expect(repository.failEmailNotification).toHaveBeenCalledWith(
      data.scheduledActionId,
      prepared.attempt_id,
      'rate_limit_exceeded',
    );
  });

  it('fails the action even when notification preparation cannot be recovered', async () => {
    jest
      .mocked(repository.prepareEmailNotification)
      .mockRejectedValue(new Error('LETTER_NOT_AVAILABLE'));
    const job = {
      name: 'send_notification',
      data,
      attemptsMade: 5,
      opts: { attempts: 5 },
    } as Job<ScheduledActionJob>;

    await processor.onFailed(job, new Error('LETTER_NOT_AVAILABLE'));

    expect(repository.markActionFailed).toHaveBeenCalledWith(
      data.scheduledActionId,
      'LETTER_NOT_AVAILABLE',
    );
  });

  it('rejects address-confirmation jobs handled by a future processor', async () => {
    await expect(
      processor.process({
        name: 'send_address_confirmation',
        data: { ...data, actionType: 'send_address_confirmation' },
      } as Job<ScheduledActionJob>),
    ).rejects.toThrow('UNSUPPORTED_NOTIFICATION_JOB');
  });
});
