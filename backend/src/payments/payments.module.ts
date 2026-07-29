import { Module } from '@nestjs/common';
import { LettersModule } from '../letters/letters.module';
import { PAYMENT_PROVIDER } from './payment-provider';
import { MockPaymentProvider } from './mock-payment.provider';
import { MockPaymentsController } from './mock-payments.controller';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { PricingService } from './pricing.service';

@Module({
  imports: [LettersModule],
  controllers: [PaymentsController, MockPaymentsController],
  providers: [
    MockPaymentProvider,
    PaymentsRepository,
    PaymentsService,
    PricingService,
    {
      provide: PAYMENT_PROVIDER,
      useExisting: MockPaymentProvider,
    },
  ],
})
export class PaymentsModule {}
