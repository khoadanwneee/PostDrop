export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentEventType =
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'payment.refunded';

export type ProductCode =
  | 'digital_letter'
  | 'printed_letter'
  | 'stored_original';

export type PaymentProviderName = 'mock' | 'payos';

export interface CreateProviderCheckoutInput {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: 'VND';
  description: string;
}

export interface ProviderCheckout {
  provider: PaymentProviderName;
  providerPaymentId: string;
  kind: 'mock' | 'redirect';
  checkoutUrl: string;
  checkoutSession?: {
    tokenHash: string;
    expiresAt: string;
  };
}

export interface ProviderPaymentEvent {
  provider: PaymentProviderName;
  providerEventId: string;
  providerPaymentId: string;
  type: PaymentEventType;
  amount: number;
  currency: 'VND';
  orderId: string;
  occurredAt: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createCheckout(
    input: CreateProviderCheckoutInput,
  ): Promise<ProviderCheckout>;
}

export interface OrderRow {
  id: string;
  owner_id: string;
  letter_id: string;
  product_code: ProductCode;
  pricing_version: string;
  amount: number;
  currency: 'VND';
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paid_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  provider: PaymentProviderName;
  provider_payment_id: string;
  amount: number;
  currency: 'VND';
  status: PaymentStatus;
  failure_code: string | null;
  succeeded_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}
