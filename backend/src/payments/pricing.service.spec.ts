import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const pricing = new PricingService();

  it('publishes the same digital and physical prices used at checkout', () => {
    expect(pricing.catalog()).toMatchObject({
      pricingVersion: 'mock-v2',
      currency: 'VND',
      digital: { amount: 29_000 },
      physical: { amount: 49_000 },
    });

    expect(
      pricing.quote({
        delivery_method: 'digital',
        physical_fulfillment_mode: null,
      }),
    ).toMatchObject({ amount: 29_000, pricingVersion: 'mock-v2' });
    expect(
      pricing.quote({
        delivery_method: 'physical',
        physical_fulfillment_mode: 'print_design',
      }),
    ).toMatchObject({ amount: 49_000, pricingVersion: 'mock-v2' });
    expect(
      pricing.quote({
        delivery_method: 'physical',
        physical_fulfillment_mode: 'stored_original',
      }),
    ).toMatchObject({ amount: 49_000, pricingVersion: 'mock-v2' });
  });
});
