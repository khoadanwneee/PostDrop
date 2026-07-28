import { PostDropQueueName } from '../queue/queue.constants';
import { ScheduledActionType } from '../queue/queue-routing';

export interface ScheduledActionJob {
  scheduledActionId: string;
  letterId: string;
  actionType: ScheduledActionType;
  idempotencyKey: string;
  dispatchCount: number;
}

export interface ClaimedOutboxEvent {
  id: string;
  scheduled_action_id: string;
  dispatch_count: number;
  queue_name: PostDropQueueName;
  job_name: ScheduledActionType;
  job_id: string;
  payload: ScheduledActionJob;
  publish_attempt_count: number;
}

export interface PreparedEmailNotification {
  should_send: boolean;
  attempt_id: string;
  recipient_email: string;
  recipient_name: string;
  letter_title: string;
  idempotency_key: string;
}
