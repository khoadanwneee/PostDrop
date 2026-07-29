export interface LetterAvailableEmail {
  to: string;
  recipientName: string;
  letterTitle: string;
  idempotencyKey: string;
  revealUrl: string;
}

export interface EmailSendResult {
  providerMessageId: string;
}

export interface EmailProvider {
  sendLetterAvailable(
    message: LetterAvailableEmail,
  ): Promise<EmailSendResult>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
