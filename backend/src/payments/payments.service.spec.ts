import {
  ConflictException,
  ForbiddenException,
  GoneException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { LettersService } from '../letters/letters.service';
import { SupabaseService } from '../supabase/supabase.service';
import { MockPaymentProvider } from './mock-payment.provider';
import {
  PaymentContext,
  PaymentsRepository,
} from './payments.repository';
import { PaymentsService } from './payments.service';
import { PricingService } from './pricing.service';

describe('PaymentsService', () => {
  const ownerId = '11111111-1111-4111-8111-111111111111';
  const letterId = '22222222-2222-4222-8222-222222222222';
  const paymentId = '33333333-3333-4333-8333-333333333333';
  const orderId = '44444444-4444-4444-8444-444444444444';
  const checkoutToken = 'a'.repeat(43);
  const supabase = {} as SupabaseClient;

  const pendingContext = (): PaymentContext => ({
    order: {
      id: orderId,
      owner_id: ownerId,
      letter_id: letterId,
      product_code: 'digital_letter',
      pricing_version: 'mock-v1',
      amount: 10_000,
      currency: 'VND',
      status: 'pending',
      paid_at: null,
      cancelled_at: null,
      refunded_at: null,
      created_at: '2026-07-29T00:00:00.000Z',
      updated_at: '2026-07-29T00:00:00.000Z',
    },
    payment: {
      id: paymentId,
      order_id: orderId,
      provider: 'mock',
      provider_payment_id: `mock_payment_${paymentId}`,
      amount: 10_000,
      currency: 'VND',
      status: 'pending',
      failure_code: null,
      succeeded_at: null,
      cancelled_at: null,
      refunded_at: null,
      created_at: '2026-07-29T00:00:00.000Z',
      updated_at: '2026-07-29T00:00:00.000Z',
    },
  });

  const paidContext = (): PaymentContext => {
    const context = pendingContext();
    context.order.status = 'paid';
    context.order.paid_at = '2026-07-29T00:01:00.000Z';
    context.payment.status = 'succeeded';
    context.payment.succeeded_at = '2026-07-29T00:01:00.000Z';
    return context;
  };

  const hostedContext = (expiresAt: string) => ({
    ...pendingContext(),
    session: {
      id: '55555555-5555-4555-8555-555555555555',
      payment_id: paymentId,
      token_hash: 'f'.repeat(64),
      expires_at: expiresAt,
      created_at: '2026-07-29T00:00:00.000Z',
      updated_at: '2026-07-29T00:00:00.000Z',
    },
  });

  let repository: jest.Mocked<PaymentsRepository>;
  let letters: jest.Mocked<LettersService>;
  let provider: jest.Mocked<MockPaymentProvider>;
  let supabaseService: jest.Mocked<SupabaseService>;
  let config: Pick<ConfigService, 'get' | 'getOrThrow'>;
  let service: PaymentsService;

  beforeEach(() => {
    repository = {
      findLetter: jest.fn(),
      findByPaymentId: jest.fn(),
      findReusableCheckout: jest.fn(),
      createCheckout: jest.fn(),
      applyEvent: jest.fn(),
      saveMockCheckoutSession: jest.fn(),
      findByCheckoutToken: jest.fn(),
    } as unknown as jest.Mocked<PaymentsRepository>;
    letters = {
      assertReadyForSealing: jest.fn(),
      findOne: jest.fn(),
      seal: jest.fn(),
    } as unknown as jest.Mocked<LettersService>;
    config = {
      get: jest.fn(() => 'development'),
      getOrThrow: jest.fn(() => 'http://localhost:3000'),
    };
    provider = new MockPaymentProvider(
      config as ConfigService,
    ) as jest.Mocked<MockPaymentProvider>;
    supabaseService = {
      createServiceClient: jest.fn(() => supabase),
    } as unknown as jest.Mocked<SupabaseService>;
    service = new PaymentsService(
      provider,
      provider,
      repository,
      new PricingService(),
      letters,
      supabaseService,
      config as ConfigService,
    );
  });

  it('creates a server-priced mock checkout for a ready draft', async () => {
    repository.findReusableCheckout.mockResolvedValue(null);
    repository.findLetter.mockResolvedValue({
      id: letterId,
      title: 'Future letter',
      content_status: 'draft',
      delivery_method: 'digital',
      physical_fulfillment_mode: null,
    });
    repository.createCheckout.mockImplementation(async (input) => {
      const context = pendingContext();
      context.payment.id = input.paymentId;
      context.payment.provider_payment_id = input.providerPaymentId;
      return context;
    });

    const result = await service.createCheckout(supabase, ownerId, letterId);

    expect(letters.assertReadyForSealing).toHaveBeenCalledWith(
      supabase,
      letterId,
    );
    expect(repository.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId,
        letterId,
        productCode: 'digital_letter',
        amount: 10_000,
        currency: 'VND',
      }),
    );
    expect(result).toMatchObject({
      provider: 'mock',
      status: 'pending',
      amount: 10_000,
      currency: 'VND',
      checkoutUrl: expect.stringContaining('/checkout?'),
    });
    expect(repository.saveMockCheckoutSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/^[0-9a-f]{64}$/),
      expect.any(String),
    );
  });

  it('seals the letter only after a successful payment event', async () => {
    repository.findByPaymentId.mockResolvedValue(pendingContext());
    repository.applyEvent.mockResolvedValue(paidContext());
    letters.findOne.mockResolvedValue({
      contentStatus: 'draft',
    } as never);

    const result = await service.simulate(
      supabase,
      ownerId,
      paymentId,
      'payment.succeeded',
    );

    expect(repository.applyEvent).toHaveBeenCalledTimes(1);
    expect(letters.seal).toHaveBeenCalledWith(supabase, ownerId, letterId);
    expect(result).toMatchObject({
      status: 'succeeded',
      orderStatus: 'paid',
    });
  });

  it('does not seal after a failed payment', async () => {
    const failed = pendingContext();
    failed.order.status = 'failed';
    failed.payment.status = 'failed';
    failed.payment.failure_code = 'mock_payment_failed';
    repository.findByPaymentId.mockResolvedValue(pendingContext());
    repository.applyEvent.mockResolvedValue(failed);

    await service.simulate(
      supabase,
      ownerId,
      paymentId,
      'payment.failed',
    );

    expect(letters.findOne).not.toHaveBeenCalled();
    expect(letters.seal).not.toHaveBeenCalled();
  });

  it('rejects a provider event whose amount does not match the order', async () => {
    repository.findByPaymentId.mockResolvedValue(pendingContext());
    jest.spyOn(provider, 'createMockEvent').mockReturnValue({
      provider: 'mock',
      providerEventId: 'mock_event_bad_amount',
      providerPaymentId: `mock_payment_${paymentId}`,
      type: 'payment.succeeded',
      amount: 9_999,
      currency: 'VND',
      orderId,
      occurredAt: '2026-07-29T00:01:00.000Z',
    });

    await expect(
      service.simulate(
        supabase,
        ownerId,
        paymentId,
        'payment.succeeded',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.applyEvent).not.toHaveBeenCalled();
    expect(letters.seal).not.toHaveBeenCalled();
  });

  it('allows a successful payment retry to finish sealing', async () => {
    repository.findByPaymentId.mockResolvedValue(paidContext());
    letters.findOne.mockResolvedValue({
      contentStatus: 'draft',
    } as never);

    await service.simulate(
      supabase,
      ownerId,
      paymentId,
      'payment.succeeded',
    );

    expect(repository.applyEvent).not.toHaveBeenCalled();
    expect(letters.seal).toHaveBeenCalledWith(supabase, ownerId, letterId);
  });

  it('refuses to expose mock controls in production', async () => {
    config.get = jest.fn(() => 'production');

    await expect(
      service.createCheckout(supabase, ownerId, letterId),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.findReusableCheckout).not.toHaveBeenCalled();
  });

  it('returns safe checkout details through an opaque hosted token', async () => {
    repository.findByCheckoutToken.mockResolvedValue(
      hostedContext(new Date(Date.now() + 60_000).toISOString()),
    );

    const result = await service.findHostedCheckout(
      paymentId,
      checkoutToken,
    );

    expect(repository.findByCheckoutToken).toHaveBeenCalledWith(
      paymentId,
      expect.stringMatching(/^[0-9a-f]{64}$/),
    );
    expect(result).toMatchObject({
      provider: 'mock',
      merchant: { name: 'PostDrop' },
      paymentId,
      amount: 10_000,
      currency: 'VND',
      status: 'pending',
      actions: {
        complete: {
          method: 'POST',
          path: `/api/mock-payments/${paymentId}/complete`,
        },
      },
    });
    expect(result).not.toHaveProperty('ownerId');
    expect(result).not.toHaveProperty('tokenHash');
  });

  it('completes and seals from the hosted checkout without a user bearer token', async () => {
    const hosted = hostedContext(
      new Date(Date.now() + 60_000).toISOString(),
    );
    repository.findByCheckoutToken.mockResolvedValue(hosted);
    repository.applyEvent.mockResolvedValue(paidContext());
    letters.findOne.mockResolvedValue({
      contentStatus: 'draft',
    } as never);

    const result = await service.simulateHostedCheckout(
      paymentId,
      checkoutToken,
      'payment.succeeded',
    );

    expect(supabaseService.createServiceClient).toHaveBeenCalled();
    expect(letters.seal).toHaveBeenCalledWith(supabase, ownerId, letterId);
    expect(result.status).toBe('succeeded');
  });

  it('rejects an expired hosted checkout before changing payment state', async () => {
    repository.findByCheckoutToken.mockResolvedValue(
      hostedContext(new Date(Date.now() - 60_000).toISOString()),
    );

    await expect(
      service.simulateHostedCheckout(
        paymentId,
        checkoutToken,
        'payment.succeeded',
      ),
    ).rejects.toBeInstanceOf(GoneException);
    expect(repository.applyEvent).not.toHaveBeenCalled();
    expect(letters.seal).not.toHaveBeenCalled();
  });
});
