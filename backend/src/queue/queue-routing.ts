import {
  DELIVERY_QUEUE,
  FULFILLMENT_QUEUE,
  NOTIFICATIONS_QUEUE,
  PostDropQueueName,
} from './queue.constants';

export type ScheduledActionType =
  | 'release_letter'
  | 'send_notification'
  | 'send_address_confirmation'
  | 'create_print_order';

export function queueForAction(
  actionType: ScheduledActionType,
): PostDropQueueName {
  switch (actionType) {
    case 'release_letter':
      return DELIVERY_QUEUE;
    case 'send_notification':
    case 'send_address_confirmation':
      return NOTIFICATIONS_QUEUE;
    case 'create_print_order':
      return FULFILLMENT_QUEUE;
  }
}
