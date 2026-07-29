import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MockCheckoutTokenDto } from './dto/mock-checkout-token.dto';
import { PaymentsService } from './payments.service';

@ApiTags('mock-payments')
@Controller('mock-payments')
export class MockPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':id')
  findCheckout(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MockCheckoutTokenDto,
  ) {
    return this.paymentsService.findHostedCheckout(id, query.token);
  }

  @Post(':id/complete')
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MockCheckoutTokenDto,
  ) {
    return this.paymentsService.simulateHostedCheckout(
      id,
      query.token,
      'payment.succeeded',
    );
  }

  @Post(':id/fail')
  fail(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MockCheckoutTokenDto,
  ) {
    return this.paymentsService.simulateHostedCheckout(
      id,
      query.token,
      'payment.failed',
    );
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MockCheckoutTokenDto,
  ) {
    return this.paymentsService.simulateHostedCheckout(
      id,
      query.token,
      'payment.cancelled',
    );
  }
}
