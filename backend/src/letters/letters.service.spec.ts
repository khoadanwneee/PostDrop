import { BadRequestException } from '@nestjs/common';
import { SealedAttachmentsService } from '../assets/sealed-attachments.service';
import { EncryptionService } from '../encryption/encryption.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LettersService } from './letters.service';

describe('LettersService sealing validation', () => {
  const service = new LettersService(
    {} as EncryptionService,
    {} as SealedAttachmentsService,
    {} as SupabaseService,
  );
  const expectedArrival = () =>
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const validate = (overrides: Record<string, unknown>) =>
    (
      service as unknown as {
        validateForSealing(letter: Record<string, unknown>): void;
      }
    ).validateForSealing({
      title: 'Future letter',
      content: 'A sufficiently long digital letter',
      recipient_name: 'Recipient',
      recipient_email: 'recipient@example.com',
      address: null,
      delivery_at: expectedArrival(),
      delivery_method: 'digital',
      physical_fulfillment_mode: null,
      ...overrides,
    });

  it('accepts a complete digital letter', () => {
    expect(() => validate({})).not.toThrow();
  });

  it('accepts a printed-design order with digital content and an address', () => {
    expect(() =>
      validate({
        recipient_email: '',
        address: '123 Example Street',
        delivery_method: 'physical',
        physical_fulfillment_mode: 'print_design',
      }),
    ).not.toThrow();
  });

  it('accepts a stored-original order without digital content', () => {
    expect(() =>
      validate({
        content: '',
        recipient_email: '',
        address: '123 Example Street',
        delivery_method: 'physical',
        physical_fulfillment_mode: 'stored_original',
      }),
    ).not.toThrow();
  });

  it('rejects digital content for a stored-original order', () => {
    expect(() =>
      validate({
        address: '123 Example Street',
        delivery_method: 'physical',
        physical_fulfillment_mode: 'stored_original',
      }),
    ).toThrow(BadRequestException);
  });

  describe('update method on sealed letters', () => {
    it('allows updating address and delivery contact on sealed letters', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            id: 'letter-1',
            title: 'Sealed letter',
            content_status: 'sealed',
            address: 'New Address 456',
            recipient_name: 'Recipient',
            recipient_email: 'rec@example.com',
          },
          error: null,
        }),
        update: jest.fn().mockReturnThis(),
      };

      jest.spyOn(service as any, 'findRow').mockResolvedValue({
        id: 'letter-1',
        content_status: 'sealed',
        address: 'Old Address 123',
      });

      const updated = await service.update(mockSupabase as any, 'letter-1', {
        address: 'New Address 456',
      });

      expect(updated.address).toBe('New Address 456');
    });

    it('rejects updating content fields on sealed letters', async () => {
      const mockSupabase = {} as any;
      jest.spyOn(service as any, 'findRow').mockResolvedValue({
        id: 'letter-1',
        content_status: 'sealed',
      });

      await expect(
        service.update(mockSupabase, 'letter-1', { title: 'New Title' }),
      ).rejects.toThrow('A sealed letter content cannot be edited');
    });
  });
});
