import { Job } from 'bullmq';
import { ScheduledActionJob } from './scheduling.types';
import { LetterReleaseProcessor } from './letter-release.processor';
import { SchedulingRepository } from './scheduling.repository';

describe('LetterReleaseProcessor', () => {
  const repository = {
    completeLetterRelease: jest.fn(),
    markActionFailed: jest.fn(),
  } as unknown as SchedulingRepository;
  const processor = new LetterReleaseProcessor(repository);
  const data: ScheduledActionJob = {
    scheduledActionId: '11111111-1111-4111-8111-111111111111',
    letterId: '22222222-2222-4222-8222-222222222222',
    actionType: 'release_letter',
    idempotencyKey: 'release_letter:22222222-2222-4222-8222-222222222222',
    dispatchCount: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes a release through the idempotent database transition', async () => {
    jest.mocked(repository.completeLetterRelease).mockResolvedValue(true);
    const job = {
      name: 'release_letter',
      data,
    } as Job<ScheduledActionJob>;

    await expect(processor.process(job)).resolves.toBeUndefined();

    expect(repository.completeLetterRelease).toHaveBeenCalledWith(
      data.scheduledActionId,
      data.letterId,
    );
  });

  it('rejects unrelated jobs on the delivery queue', async () => {
    const job = {
      name: 'create_print_order',
      data: { ...data, actionType: 'create_print_order' },
    } as Job<ScheduledActionJob>;

    await expect(processor.process(job)).rejects.toThrow(
      'UNSUPPORTED_DELIVERY_JOB',
    );
    expect(repository.completeLetterRelease).not.toHaveBeenCalled();
  });

  it('persists a failure only after BullMQ exhausts its retries', async () => {
    const job = {
      name: 'release_letter',
      data,
      attemptsMade: 5,
      opts: { attempts: 5 },
    } as Job<ScheduledActionJob>;

    await processor.onFailed(job, new Error('DATABASE_UNAVAILABLE'));

    expect(repository.markActionFailed).toHaveBeenCalledWith(
      data.scheduledActionId,
      'DATABASE_UNAVAILABLE',
    );
  });

  it('leaves the database action queued while BullMQ will retry', async () => {
    const job = {
      name: 'release_letter',
      data,
      attemptsMade: 2,
      opts: { attempts: 5 },
    } as Job<ScheduledActionJob>;

    await processor.onFailed(job, new Error('TEMPORARY_FAILURE'));

    expect(repository.markActionFailed).not.toHaveBeenCalled();
  });
});
