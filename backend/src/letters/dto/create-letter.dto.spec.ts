import { validate } from 'class-validator';
import { CreateLetterDto } from './create-letter.dto';

function dtoWith(values: Partial<CreateLetterDto>): CreateLetterDto {
  return Object.assign(new CreateLetterDto(), values);
}

describe('CreateLetterDto delivery model', () => {
  it.each(['email', 'hybrid'])('rejects the removed %s method', async (method) => {
    const errors = await validate(
      dtoWith({
        deliveryMethod: method as CreateLetterDto['deliveryMethod'],
      }),
    );

    expect(errors.some((error) => error.property === 'deliveryMethod')).toBe(true);
  });

  it('accepts digital delivery with an expected arrival instant', async () => {
    const errors = await validate(
      dtoWith({
        deliveryMethod: 'digital',
        expectedArrivalAt: '2030-01-02T03:04:05.000Z',
      }),
    );

    expect(errors).toHaveLength(0);
  });

  it.each(['print_design', 'stored_original'] as const)(
    'accepts physical delivery using %s',
    async (physicalFulfillmentMode) => {
      const errors = await validate(
        dtoWith({
          deliveryMethod: 'physical',
          physicalFulfillmentMode,
          expectedArrivalAt: '2030-01-02T03:04:05.000Z',
        }),
      );

      expect(errors).toHaveLength(0);
    },
  );

  it('requires a physical fulfillment mode for physical delivery', async () => {
    const errors = await validate(
      dtoWith({
        deliveryMethod: 'physical',
      }),
    );

    expect(
      errors.some((error) => error.property === 'physicalFulfillmentMode'),
    ).toBe(true);
  });
});
