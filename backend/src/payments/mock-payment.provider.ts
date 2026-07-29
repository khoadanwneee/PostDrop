import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  CreateProviderCheckoutInput,
  PaymentProvider,
  ProviderPaymentEvent,
} from './payment.types';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock' as const;

  constructor(private readonly config: ConfigService) {}

  async createCheckout(input: CreateProviderCheckoutInput) {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const appUrl = this.config.getOrThrow<string>('PUBLIC_APP_URL');
    const checkoutUrl = new URL(
      'checkout',
      appUrl.endsWith('/') ? appUrl : `${appUrl}/`,
    );
    checkoutUrl.searchParams.set('paymentId', input.paymentId);
    checkoutUrl.searchParams.set('token', token);

    return {
      provider: this.name,
      providerPaymentId: `mock_payment_${input.paymentId}`,
      kind: 'mock' as const,
      checkoutUrl: checkoutUrl.toString(),
      checkoutSession: {
        tokenHash,
        expiresAt,
      },
    };
  }

  createMockEvent(
    input: CreateProviderCheckoutInput & {
      type: ProviderPaymentEvent['type'];
    },
  ): ProviderPaymentEvent {
    return {
      provider: this.name,
      providerEventId: `mock_event_${randomUUID()}`,
      providerPaymentId: `mock_payment_${input.paymentId}`,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      orderId: input.orderId,
      occurredAt: new Date().toISOString(),
    };
  }
}
