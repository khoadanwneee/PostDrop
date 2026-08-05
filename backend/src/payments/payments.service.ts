import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';
import { LettersService } from '../letters/letters.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PAYMENT_PROVIDER } from './payment-provider';
import { MockPaymentProvider } from './mock-payment.provider';
import {
  MockCheckoutContext,
  PaymentContext,
  PaymentsRepository,
} from './payments.repository';
import { PricingService } from './pricing.service';
import {
  CreateProviderCheckoutInput,
  PaymentEventType,
  PaymentProvider,
  ProviderCheckout,
  ProviderPaymentEvent,
} from './payment.types';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENT_PROVIDER)
    private readonly provider: PaymentProvider,
    private readonly mockProvider: MockPaymentProvider,
    private readonly repository: PaymentsRepository,
    private readonly pricingService: PricingService,
    private readonly lettersService: LettersService,
    private readonly supabaseService: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  async createCheckout(
    supabase: SupabaseClient,
    ownerId: string,
    letterId: string,
  ) {
    this.assertMockEnabled();
    await this.lettersService.assertReadyForSealing(supabase, letterId);

    const reusable = await this.repository.findReusableCheckout(
      ownerId,
      letterId,
    );
    if (reusable) {
      if (reusable.payment.status !== 'pending') {
        return this.toResponse(reusable);
      }
      const providerCheckout = await this.provider.createCheckout({
        paymentId: reusable.payment.id,
        orderId: reusable.order.id,
        amount: reusable.order.amount,
        currency: reusable.order.currency,
        description: reusable.order.product_code,
      });
      await this.saveCheckoutSession(reusable, providerCheckout);
      return this.toResponse(reusable, providerCheckout);
    }

    const letter = await this.repository.findLetter(ownerId, letterId);
    if (letter.content_status !== 'draft') {
      throw new ConflictException('The letter has already been sealed');
    }

    const quote = this.pricingService.quote(letter);
    const paymentId = randomUUID();
    const provisional: CreateProviderCheckoutInput = {
      paymentId,
      orderId: 'pending',
      amount: quote.amount,
      currency: quote.currency,
      description: letter.title,
    };
    const providerCheckout = await this.provider.createCheckout(provisional);

    const context = await this.repository.createCheckout({
      ownerId,
      letterId,
      ...quote,
      paymentId,
      providerPaymentId: providerCheckout.providerPaymentId,
    });
    await this.saveCheckoutSession(context, providerCheckout);
    return this.toResponse(context, providerCheckout);
  }

  async findOne(ownerId: string, paymentId: string) {
    const context = await this.repository.findByPaymentId(ownerId, paymentId);
    return this.toResponse(context);
  }

  async findByLetter(ownerId: string, letterId: string) {
    const context = await this.repository.findByLetterId(ownerId, letterId);
    return this.toResponse(context);
  }

  async simulate(
    supabase: SupabaseClient,
    ownerId: string,
    paymentId: string,
    type: PaymentEventType,
  ) {
    this.assertMockEnabled();
    let context = await this.repository.findByPaymentId(ownerId, paymentId);
    this.assertTransition(context, type);

    if (
      context.payment.status === 'succeeded' &&
      type === 'payment.succeeded'
    ) {
      await this.ensureSealed(supabase, ownerId, context);
      return this.toResponse(context);
    }

    const event = this.mockProvider.createMockEvent({
      paymentId: context.payment.id,
      orderId: context.order.id,
      amount: context.order.amount,
      currency: context.order.currency,
      description: context.order.product_code,
      type,
    });
    this.validateEvent(context, event);
    context = await this.repository.applyEvent(context, event);

    if (type === 'payment.succeeded') {
      await this.ensureSealed(supabase, ownerId, context);
    }
    return this.toResponse(context);
  }

  async findHostedCheckout(paymentId: string, token: string) {
    this.assertMockEnabled();
    const context = await this.findHostedContext(paymentId, token);
    return this.toHostedResponse(context, token);
  }

  async simulateHostedCheckout(
    paymentId: string,
    token: string,
    type: Exclude<PaymentEventType, 'payment.refunded'>,
  ) {
    this.assertMockEnabled();
    let context = await this.findHostedContext(paymentId, token);
    this.assertTransition(context, type);

    if (
      context.payment.status === 'succeeded' &&
      type === 'payment.succeeded'
    ) {
      await this.ensureSealed(
        this.supabaseService.createServiceClient(),
        context.order.owner_id,
        context,
      );
      return this.toHostedResponse(context, token);
    }

    const event = this.mockProvider.createMockEvent({
      paymentId: context.payment.id,
      orderId: context.order.id,
      amount: context.order.amount,
      currency: context.order.currency,
      description: context.order.product_code,
      type,
    });
    this.validateEvent(context, event);
    const updated = await this.repository.applyEvent(context, event);
    context = { ...updated, session: context.session };

    if (type === 'payment.succeeded') {
      await this.ensureSealed(
        this.supabaseService.createServiceClient(),
        context.order.owner_id,
        context,
      );
    }
    return this.toHostedResponse(context, token);
  }

  private async ensureSealed(
    supabase: SupabaseClient,
    ownerId: string,
    context: PaymentContext,
  ) {
    const letter = await this.lettersService.findOne(
      supabase,
      context.order.letter_id,
    );
    if (letter.contentStatus === 'draft') {
      await this.lettersService.seal(
        supabase,
        ownerId,
        context.order.letter_id,
      );
    }
  }

  private assertTransition(
    context: PaymentContext,
    type: PaymentEventType,
  ) {
    if (type === 'payment.refunded') {
      if (context.payment.status !== 'succeeded') {
        throw new ConflictException(
          'Only a successful payment can be refunded',
        );
      }
      return;
    }
    if (
      type === 'payment.succeeded' &&
      context.payment.status === 'succeeded'
    ) {
      return;
    }
    if (context.payment.status !== 'pending') {
      throw new ConflictException(
        `A ${context.payment.status} payment cannot receive ${type}`,
      );
    }
  }

  private validateEvent(
    context: PaymentContext,
    event: ProviderPaymentEvent,
  ) {
    if (
      event.provider !== context.payment.provider ||
      event.providerPaymentId !== context.payment.provider_payment_id ||
      event.orderId !== context.order.id ||
      event.amount !== context.order.amount ||
      event.currency !== context.order.currency
    ) {
      throw new ConflictException(
        'Payment event does not match the authoritative order',
      );
    }
  }

  private assertMockEnabled() {
    if (this.provider.name !== 'mock') {
      throw new ForbiddenException('Mock payment controls are disabled');
    }
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException(
        'Mock payments cannot run in production',
      );
    }
  }

  private async saveCheckoutSession(
    context: PaymentContext,
    checkout: ProviderCheckout,
  ) {
    if (!checkout.checkoutSession) {
      throw new InternalServerErrorException(
        'Mock provider did not create a checkout session',
      );
    }
    await this.repository.saveMockCheckoutSession(
      context.payment.id,
      checkout.checkoutSession.tokenHash,
      checkout.checkoutSession.expiresAt,
    );
  }

  private async findHostedContext(paymentId: string, token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const context = await this.repository.findByCheckoutToken(
      paymentId,
      tokenHash,
    );
    if (new Date(context.session.expires_at).getTime() <= Date.now()) {
      throw new GoneException('Mock checkout session has expired');
    }
    return context;
  }

  private toResponse(
    context: PaymentContext,
    checkout?: ProviderCheckout,
  ) {
    const basePath = `/api/payments/${context.payment.id}/mock`;
    return {
      orderId: context.order.id,
      letterId: context.order.letter_id,
      paymentId: context.payment.id,
      provider: context.payment.provider,
      status: context.payment.status,
      orderStatus: context.order.status,
      productCode: context.order.product_code,
      pricingVersion: context.order.pricing_version,
      amount: context.order.amount,
      currency: context.order.currency,
      paidAt: context.payment.succeeded_at ?? undefined,
      checkoutUrl: checkout?.checkoutUrl,
      checkoutExpiresAt: checkout?.checkoutSession?.expiresAt,
      mock:
        context.payment.provider === 'mock'
          ? {
              notice:
                'Development-only payment. No money is transferred.',
              actions: {
                complete: { method: 'POST', path: `${basePath}/complete` },
                fail: { method: 'POST', path: `${basePath}/fail` },
                cancel: { method: 'POST', path: `${basePath}/cancel` },
                refund: { method: 'POST', path: `${basePath}/refund` },
              },
            }
          : undefined,
    };
  }

  private toHostedResponse(context: MockCheckoutContext, token: string) {
    const actionBase = `/api/mock-payments/${context.payment.id}`;
    const appUrl = this.config.getOrThrow<string>('PUBLIC_APP_URL');
    const returnUrl = new URL(
      'payment-result',
      appUrl.endsWith('/') ? appUrl : `${appUrl}/`,
    );
    returnUrl.searchParams.set('paymentId', context.payment.id);
    returnUrl.searchParams.set('token', token);

    return {
      provider: 'mock',
      environment: 'development',
      merchant: {
        name: 'PostDrop',
      },
      orderId: context.order.id,
      paymentId: context.payment.id,
      productCode: context.order.product_code,
      amount: context.order.amount,
      currency: context.order.currency,
      status: context.payment.status,
      expiresAt: context.session.expires_at,
      returnUrl: returnUrl.toString(),
      notice: 'School demonstration only. No money is transferred.',
      actions: {
        complete: { method: 'POST', path: `${actionBase}/complete` },
        fail: { method: 'POST', path: `${actionBase}/fail` },
        cancel: { method: 'POST', path: `${actionBase}/cancel` },
      },
    };
  }
}
