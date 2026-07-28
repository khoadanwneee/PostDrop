import {
  DELIVERY_QUEUE,
  FULFILLMENT_QUEUE,
  NOTIFICATIONS_QUEUE,
} from './queue.constants';
import { queueForAction } from './queue-routing';

describe('queueForAction', () => {
  it.each([
    ['release_letter', DELIVERY_QUEUE],
    ['send_notification', NOTIFICATIONS_QUEUE],
    ['send_address_confirmation', NOTIFICATIONS_QUEUE],
    ['create_print_order', FULFILLMENT_QUEUE],
  ] as const)('routes %s to %s', (actionType, queueName) => {
    expect(queueForAction(actionType)).toBe(queueName);
  });
});
