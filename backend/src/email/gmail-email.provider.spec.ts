import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GmailEmailProvider } from './gmail-email.provider';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(),
}));

describe('GmailEmailProvider', () => {
  const setCredentials = jest.fn();
  const getAccessToken = jest.fn();
  const getTokenInfo = jest.fn();
  const request = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(OAuth2Client).mockImplementation(
      () =>
        ({
          setCredentials,
          getAccessToken,
          getTokenInfo,
          request,
        }) as never,
    );
    getAccessToken.mockResolvedValue({ token: 'short-lived-access-token' });
    getTokenInfo.mockResolvedValue({
      email: 'sender@example.edu',
    });
  });

  function createProvider(): GmailEmailProvider {
    return new GmailEmailProvider(
      new ConfigService({
        GMAIL_CLIENT_ID: 'client-id',
        GMAIL_CLIENT_SECRET: 'client-secret',
        GMAIL_REFRESH_TOKEN: 'refresh-token',
        GMAIL_SENDER_EMAIL: 'sender@example.edu',
        GMAIL_SENDER_NAME: 'PostDrop',
      }),
    );
  }

  it('uses OAuth and sends a multipart message with a professional name', async () => {
    request.mockResolvedValue({ data: { id: 'gmail-message-id' } });
    const provider = createProvider();

    await expect(
      provider.sendLetterAvailable({
        to: 'recipient@example.com',
        recipientName: '<Recipient>',
        letterTitle: 'A & B',
        idempotencyKey: 'send_notification:letter-id',
        revealUrl:
          'https://postdrop.example/reveal/letter-id#token=secure-token',
      }),
    ).resolves.toEqual({ providerMessageId: 'gmail-message-id' });

    expect(setCredentials).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    });
    expect(getTokenInfo).toHaveBeenCalledWith('short-lived-access-token');
    expect(request).toHaveBeenCalledWith({
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      method: 'POST',
      data: { raw: expect.any(String) },
    });

    const raw = request.mock.calls[0][0].data.raw as string;
    const mime = Buffer.from(raw, 'base64url').toString('utf8');
    expect(mime).toContain(
      'From: =?UTF-8?B?UG9zdERyb3A=?= <sender@example.edu>',
    );
    expect(mime).toContain('To: <recipient@example.com>');
    expect(mime).toContain('Content-ID: <postdrop-reveal-qr>');
    expect(mime).toContain('Content-Type: image/png');
    expect(mime).not.toContain('refresh-token');
  });

  it('refuses to send when OAuth belongs to another mailbox', async () => {
    getTokenInfo.mockResolvedValue({
      email: 'someone-else@example.com',
    });
    const provider = createProvider();

    await expect(
      provider.sendLetterAvailable({
        to: 'recipient@example.com',
        recipientName: 'Recipient',
        letterTitle: 'Letter',
        idempotencyKey: 'send_notification:letter-id',
        revealUrl:
          'https://postdrop.example/reveal/letter-id#token=secure-token',
      }),
    ).rejects.toThrow('GMAIL_AUTHENTICATED_SENDER_MISMATCH');
    expect(request).not.toHaveBeenCalled();
  });

  it('rejects header injection before calling Gmail', async () => {
    const provider = createProvider();

    await expect(
      provider.sendLetterAvailable({
        to: 'recipient@example.com\r\nBcc: attacker@example.com',
        recipientName: 'Recipient',
        letterTitle: 'Letter',
        idempotencyKey: 'send_notification:letter-id',
        revealUrl:
          'https://postdrop.example/reveal/letter-id#token=secure-token',
      }),
    ).rejects.toThrow('GMAIL_RECIPIENT_EMAIL_INVALID');
    expect(request).not.toHaveBeenCalled();
  });

  it('returns a bounded error code without leaking Google response data', async () => {
    request.mockRejectedValue({
      response: { status: 403 },
      message: 'domainPolicy for sender@example.edu',
    });
    const provider = createProvider();

    await expect(
      provider.sendLetterAvailable({
        to: 'recipient@example.com',
        recipientName: 'Recipient',
        letterTitle: 'Letter',
        idempotencyKey: 'send_notification:letter-id',
        revealUrl:
          'https://postdrop.example/reveal/letter-id#token=secure-token',
      }),
    ).rejects.toThrow('GMAIL_SEND_FAILED_403');
  });
});
