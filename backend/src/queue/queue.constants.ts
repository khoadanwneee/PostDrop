export const DELIVERY_QUEUE = 'delivery';
export const NOTIFICATIONS_QUEUE = 'notifications';
export const DOCUMENTS_QUEUE = 'documents';
export const FULFILLMENT_QUEUE = 'fulfillment';

export const POSTDROP_QUEUE_NAMES = [
  DELIVERY_QUEUE,
  NOTIFICATIONS_QUEUE,
  DOCUMENTS_QUEUE,
  FULFILLMENT_QUEUE,
] as const;

export type PostDropQueueName = (typeof POSTDROP_QUEUE_NAMES)[number];
