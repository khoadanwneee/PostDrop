import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductCode } from './payment.types';

interface PriceableLetter {
  delivery_method: 'digital' | 'physical';
  physical_fulfillment_mode: 'print_design' | 'stored_original' | null;
}

const MOCK_PRICES: Record<ProductCode, number> = {
  digital_letter: 29_000,
  printed_letter: 49_000,
  stored_original: 49_000,
};

@Injectable()
export class PricingService {
  catalog() {
    return {
      pricingVersion: 'mock-v2',
      currency: 'VND' as const,
      digital: {
        productCode: 'digital_letter' as const,
        amount: MOCK_PRICES.digital_letter,
      },
      physical: {
        productCode: 'printed_letter' as const,
        amount: MOCK_PRICES.printed_letter,
      },
    };
  }

  quote(letter: PriceableLetter) {
    const productCode = this.productCode(letter);
    return {
      productCode,
      amount: MOCK_PRICES[productCode],
      currency: 'VND' as const,
      pricingVersion: 'mock-v2',
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
