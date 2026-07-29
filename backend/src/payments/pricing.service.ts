import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductCode } from './payment.types';

interface PriceableLetter {
  delivery_method: 'digital' | 'physical';
  physical_fulfillment_mode: 'print_design' | 'stored_original' | null;
}

const MOCK_PRICES: Record<ProductCode, number> = {
  digital_letter: 10_000,
  printed_letter: 20_000,
  stored_original: 30_000,
};

@Injectable()
export class PricingService {
  quote(letter: PriceableLetter) {
    const productCode = this.productCode(letter);
    return {
      productCode,
      amount: MOCK_PRICES[productCode],
      currency: 'VND' as const,
      pricingVersion: 'mock-v1',
    };
  }

  private productCode(letter: PriceableLetter): ProductCode {
    if (letter.delivery_method === 'digital') {
      return 'digital_letter';
    }
    if (letter.physical_fulfillment_mode === 'print_design') {
      return 'printed_letter';
    }
    if (letter.physical_fulfillment_mode === 'stored_original') {
      return 'stored_original';
    }
    throw new BadRequestException('The letter does not define a billable product');
  }
}
