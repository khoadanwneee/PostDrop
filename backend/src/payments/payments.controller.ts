import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentsService } from './payments.service';

interface CurrentAuthValue {
  user: User;
  supabase: SupabaseClient;
}

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  createCheckout(
    @CurrentAuth() auth: CurrentAuthValue,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.paymentsService.createCheckout(
      auth.supabase,
      auth.user.id,
      dto.letterId,
    );
  }

  @Get(':id')
  findOne(@CurrentAuth() auth: CurrentAuthValue, @Param('id') id: string) {
    return this.paymentsService.findOne(auth.user.id, id);
  }

  @Post(':id/mock/complete')
  complete(@CurrentAuth() auth: CurrentAuthValue, @Param('id') id: string) {
    return this.paymentsService.simulate(
      auth.supabase,
      auth.user.id,
      id,
      'payment.succeeded',
    );
  }

  @Post(':id/mock/fail')
  fail(@CurrentAuth() auth: CurrentAuthValue, @Param('id') id: string) {
    return this.paymentsService.simulate(
      auth.supabase,
      auth.user.id,
      id,
      'payment.failed',
    );
  }

  @Post(':id/mock/cancel')
  cancel(@CurrentAuth() auth: CurrentAuthValue, @Param('id') id: string) {
    return this.paymentsService.simulate(
      auth.supabase,
      auth.user.id,
      id,
      'payment.cancelled',
    );
  }

  @Post(':id/mock/refund')
  refund(@CurrentAuth() auth: CurrentAuthValue, @Param('id') id: string) {
    return this.paymentsService.simulate(
      auth.supabase,
      auth.user.id,
      id,
      'payment.refunded',
    );
  }
}
