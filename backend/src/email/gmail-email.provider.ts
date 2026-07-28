import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import {
  EmailProvider,
  EmailSendResult,
  LetterAvailableEmail,
} from './email-provider';
import { renderLetterAvailableEmail } from './letter-available-email';

function assertEmailAddress(value: string, key: string): string {
  const trimmed = value.trim();
  if (
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(trimmed) ||
    /[\r\n]/.test(trimmed)
  ) {
    throw new Error(`${key}_INVALID`);
  }
  return trimmed;
}

function encodeHeader(value: string): string {
  if (/[\r\n]/.test(value)) {
    throw new Error('GMAIL_HEADER_INVALID');
  }
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function encodeBody(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64');
}

function googleErrorCode(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'status' in error.response &&
    (typeof error.response.status === 'number' ||
      typeof error.response.status === 'string')
  ) {
    return `GMAIL_SEND_FAILED_${String(error.response.status).slice(0, 12)}`;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (typeof error.code === 'number' || typeof error.code === 'string')
  ) {
    return `GMAIL_SEND_FAILED_${String(error.code).slice(0, 12)}`;
  }
  return 'GMAIL_SEND_FAILED';
}

@Injectable()
export class GmailEmailProvider implements EmailProvider {
  private readonly oauth: OAuth2Client;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private senderVerification?: Promise<void>;

  constructor(config: ConfigService) {
    this.oauth = new OAuth2Client(
      config.getOrThrow<string>('GMAIL_CLIENT_ID'),
      config.getOrThrow<string>('GMAIL_CLIENT_SECRET'),
    );
    this.oauth.setCredentials({
      refresh_token: config.getOrThrow<string>('GMAIL_REFRESH_TOKEN'),
    });
    this.senderEmail = assertEmailAddress(
      config.getOrThrow<string>('GMAIL_SENDER_EMAIL'),
      'GMAIL_SENDER_EMAIL',
    );
    this.senderName =
      config.get<string>('GMAIL_SENDER_NAME')?.trim() || 'PostDrop';
    if (/[\r\n]/.test(this.senderName)) {
      throw new Error('GMAIL_SENDER_NAME_INVALID');
    }
  }

  async sendLetterAvailable(
    message: LetterAvailableEmail,
  ): Promise<EmailSendResult> {
    await this.verifyAuthenticatedSender();
    const recipient = assertEmailAddress(message.to, 'GMAIL_RECIPIENT_EMAIL');
    const email = renderLetterAvailableEmail(message);
    const boundary = `postdrop-${Buffer.from(message.idempotencyKey)
      .toString('base64url')
      .slice(0, 48)}`;
    const raw = [
      `From: ${encodeHeader(this.senderName)} <${this.senderEmail}>`,
      `To: <${recipient}>`,
      `Subject: ${encodeHeader(email.subject)}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      encodeBody(email.text),
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      encodeBody(email.html),
      `--${boundary}--`,
      '',
    ].join('\r\n');

    try {
      const response = await this.oauth.request<{ id?: string }>({
        url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        method: 'POST',
        data: {
          raw: Buffer.from(raw, 'utf8').toString('base64url'),
        },
      });
      if (!response.data.id) {
        throw new Error('GMAIL_MISSING_MESSAGE_ID');
      }
      return { providerMessageId: response.data.id };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'GMAIL_MISSING_MESSAGE_ID'
      ) {
        throw error;
      }
      throw new Error(googleErrorCode(error));
    }
  }

  private verifyAuthenticatedSender(): Promise<void> {
    this.senderVerification ??= this.oauth
      .getAccessToken()
      .then(async ({ token }) => {
        if (!token) {
          throw new Error('GMAIL_ACCESS_TOKEN_MISSING');
        }
        const tokenInfo = await this.oauth.getTokenInfo(token);
        if (
          tokenInfo.email?.toLowerCase() !==
          this.senderEmail.toLowerCase()
        ) {
          throw new Error('GMAIL_AUTHENTICATED_SENDER_MISMATCH');
        }
      })
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          [
            'GMAIL_ACCESS_TOKEN_MISSING',
            'GMAIL_AUTHENTICATED_SENDER_MISMATCH',
          ].includes(error.message)
        ) {
          throw error;
        }
        throw new Error(googleErrorCode(error));
      });
    return this.senderVerification;
  }
}
