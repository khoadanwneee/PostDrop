import { renderLetterAvailableEmail } from './letter-available-email';

describe('renderLetterAvailableEmail', () => {
  it('includes a secure reveal link and an embedded QR code without letter content', async () => {
    const revealUrl =
      'https://postdrop.example/reveal/letter-id#token=secure-capability';
    const rendered = await renderLetterAvailableEmail({
      to: 'recipient@example.com',
      recipientName: '<Recipient>',
      letterTitle: 'A & B',
      idempotencyKey: 'send_notification:letter-id',
      revealUrl,
    });

    expect(rendered.text).toContain(revealUrl);
    expect(rendered.html).toContain('cid:postdrop-reveal-qr');
    expect(rendered.qrCode.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(rendered.html).toContain('&lt;Recipient&gt;');
    expect(rendered.html).toContain('A &amp; B');
    expect(rendered.html).not.toContain('private letter body');
  });
});
