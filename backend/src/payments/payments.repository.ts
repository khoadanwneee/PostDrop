import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { SupabaseService } from '../supabase/supabase.service';
import {
  OrderRow,
  PaymentRow,
  ProductCode,
  ProviderPaymentEvent,
} from './payment.types';

interface CheckoutLetterRow {
  id: string;
  title: string;
  content_status: 'draft' | 'sealed';
  delivery_method: 'digital' | 'physical';
  physical_fulfillment_mode: 'print_design' | 'stored_original' | null;
}

export interface PaymentContext {
  order: OrderRow;
  payment: PaymentRow;
}

export interface MockCheckoutSessionRow {
  id: string;
  payment_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MockCheckoutContext extends PaymentContext {
  session: MockCheckoutSessionRow;
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findLetter(
    ownerId: string,
    letterId: string,
  ): Promise<CheckoutLetterRow> {
    const { data, error } = await this.client()
      .from('letters')
      .select(
        'id,title,content_status,delivery_method,physical_fulfillment_mode',
      )
      .eq('id', letterId)
      .eq('owner_id', ownerId)
      .maybeSingle();

    this.throwOnError(error);
    if (!data) {
      throw new NotFoundException('Letter not found');
    }
    return data as unknown as CheckoutLetterRow;
  }

  async findByPaymentId(
    ownerId: string,
    paymentId: string,
  ): Promise<PaymentContext> {
    const { data: paymentData, error: paymentError } = await this.client()
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .maybeSingle();
    this.throwOnError(paymentError);
    if (!paymentData) {
      throw new NotFoundException('Payment not found');
    }

    const payment = paymentData as unknown as PaymentRow;
    const { data: orderData, error: orderError } = await this.client()
      .from('orders')
      .select('*')
      .eq('id', payment.order_id)
      .eq('owner_id', ownerId)
      .maybeSingle();
    this.throwOnError(orderError);
    if (!orderData) {
      throw new NotFoundException('Payment not found');
    }

    return {
      order: orderData as unknown as OrderRow,
      payment,
    };
  }

  async findByLetterId(
    ownerId: string,
    letterId: string,
  ): Promise<PaymentContext> {
    const order = await this.findOrder(ownerId, letterId);
    if (!order) {
      throw new NotFoundException('Payment not found');
    }
    const payment = await this.findLatestPayment(order.id);
    return { order, payment };
  }

  async findReusableCheckout(
    ownerId: string,
    letterId: string,
  ): Promise<PaymentContext | null> {
    const { data: orderData, error: orderError } = await this.client()
      .from('orders')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('letter_id', letterId)
      .maybeSingle();
    this.throwOnError(orderError);
    if (!orderData) {
      return null;
    }

    const order = orderData as unknown as OrderRow;
    if (order.status === 'paid' || order.status === 'refunded') {
      const payment = await this.findLatestPayment(order.id);
      return { order, payment };
    }

    const { data: paymentData, error: paymentError } = await this.client()
      .from('payments')
      .select('*')
      .eq('order_id', order.id)
      .eq('status', 'pending')
      .maybeSingle();
    this.throwOnError(paymentError);
    if (!paymentData) {
      return null;
    }
    return {
      order,
      payment: paymentData as unknown as PaymentRow,
    };
  }

  async saveMockCheckoutSession(
    paymentId: string,
    tokenHash: string,
    expiresAt: string,
  ): Promise<MockCheckoutSessionRow> {
    const { data, error } = await this.client()
      .from('mock_checkout_sessions')
      .upsert(
        {
          payment_id: paymentId,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
        { onConflict: 'payment_id' },
      )
      .select('*')
      .single();
    this.throwOnError(error);
    return data as unknown as MockCheckoutSessionRow;
  }

  async findByCheckoutToken(
    paymentId: string,
    tokenHash: string,
  ): Promise<MockCheckoutContext> {
    const { data: sessionData, error: sessionError } = await this.client()
      .from('mock_checkout_sessions')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('token_hash', tokenHash)
      .maybeSingle();
    this.throwOnError(sessionError);
    if (!sessionData) {
      throw new NotFoundException('Mock checkout not found');
    }
    const session = sessionData as unknown as MockCheckoutSessionRow;

    const { data: paymentData, error: paymentError } = await this.client()
      .from('payments')
      .select('*')
      .eq('id', session.payment_id)
      .eq('provider', 'mock')
      .maybeSingle();
    this.throwOnError(paymentError);
    if (!paymentData) {
      throw new NotFoundException('Mock checkout not found');
    }
    const payment = paymentData as unknown as PaymentRow;

    const { data: orderData, error: orderError } = await this.client()
      .from('orders')
      .select('*')
      .eq('id', payment.order_id)
      .maybeSingle();
    this.throwOnError(orderError);
    if (!orderData) {
      throw new NotFoundException('Mock checkout not found');
    }

    return {
      session,
      payment,
      order: orderData as unknown as OrderRow,
    };
  }

  async createCheckout(input: {
    ownerId: string;
    letterId: string;
    productCode: ProductCode;
    pricingVersion: string;
    amount: number;
    currency: 'VND';
    providerPaymentId: string;
    paymentId: string;
  }): Promise<PaymentContext> {
    const existing = await this.findOrder(input.ownerId, input.letterId);
    let order: OrderRow;

    if (existing) {
      if (existing.status === 'paid' || existing.status === 'refunded') {
        throw new ConflictException('The letter order has already been paid');
      }
      const { data, error } = await this.client()
        .from('orders')
        .update({
          product_code: input.productCode,
          pricing_version: input.pricingVersion,
          amount: input.amount,
          currency: input.currency,
          status: 'pending',
        })
        .eq('id', existing.id)
        .eq('owner_id', input.ownerId)
        .select('*')
        .single();
      this.throwOnError(error);
      order = data as unknown as OrderRow;
    } else {
      const { data, error } = await this.client()
        .from('orders')
        .insert({
          id: randomUUID(),
          owner_id: input.ownerId,
          letter_id: input.letterId,
          product_code: input.productCode,
          pricing_version: input.pricingVersion,
          amount: input.amount,
          currency: input.currency,
          status: 'pending',
        })
        .select('*')
        .single();
      this.throwOnError(error);
      order = data as unknown as OrderRow;
    }

    const { data: paymentData, error: paymentError } = await this.client()
      .from('payments')
      .insert({
        id: input.paymentId,
        order_id: order.id,
        provider: 'mock',
        provider_payment_id: input.providerPaymentId,
        amount: input.amount,
        currency: input.currency,
        status: 'pending',
      })
      .select('*')
      .single();
    this.throwOnError(paymentError);

    return {
      order,
      payment: paymentData as unknown as PaymentRow,
    };
  }

  async applyEvent(
    context: PaymentContext,
    event: ProviderPaymentEvent,
  ): Promise<PaymentContext> {
    const { data, error } = await this.client().rpc(
      'apply_mock_payment_event',
      {
        p_owner_id: context.order.owner_id,
        p_payment_id: context.payment.id,
        p_provider_event_id: event.providerEventId,
        p_provider_payment_id: event.providerPaymentId,
        p_event_type: event.type,
        p_order_id: event.orderId,
        p_amount: event.amount,
        p_currency: event.currency,
        p_occurred_at: event.occurredAt,
        p_payload: event,
      },
    );
    if (error?.code === 'P0002') {
      throw new NotFoundException('Payment not found');
    }
    if (error?.code === 'P0001' || error?.code === '23514') {
      throw new ConflictException(error.message);
    }
    this.throwOnError(error);
    return data as unknown as PaymentContext;
  }

  private async findOrder(ownerId: string, letterId: string) {
    const { data, error } = await this.client()
      .from('orders')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('letter_id', letterId)
      .maybeSingle();
    this.throwOnError(error);
    return data ? (data as unknown as OrderRow) : null;
  }

  private async findLatestPayment(orderId: string): Promise<PaymentRow> {
    const { data, error } = await this.client()
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    this.throwOnError(error);
    return data as unknown as PaymentRow;
  }

  private client() {
    return this.supabaseService.createServiceClient();
  }

  private throwOnError(error: { code?: string; message: string } | null): void {
    if (!error) {
      return;
    }
    throw new InternalServerErrorException({
      message: 'Payment persistence failed',
      code: error.code,
    });
  }
}
