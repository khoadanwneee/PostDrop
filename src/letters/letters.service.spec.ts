import { LettersService } from './letters.service';

describe('LettersService', () => {
  let service: LettersService;

  beforeEach(() => { service = new LettersService(); });

  it('returns seeded dashboard data', () => {
    const dashboard = service.dashboard();
    expect(dashboard.letters.length).toBeGreaterThanOrEqual(2);
    expect(dashboard.summary.stored).toBeGreaterThanOrEqual(1);
  });

  it('creates and seals a letter without exposing its content', () => {
    const letter = service.create({
      title: 'Thư cho tương lai', content: 'Một nội dung đủ dài để lưu lại.',
      recipientName: 'An', recipientEmail: 'an@example.com', deliveryDate: '2027-07-11',
      deliveryMethod: 'email', letterType: 'online',
    });
    const sealed = service.seal(letter.id);
    expect(sealed.status).toBe('stored');
    expect(sealed.content).toBe('');
    expect(sealed.sealedAt).toBeDefined();
  });
});
