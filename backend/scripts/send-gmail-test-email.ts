import { ConfigService } from '@nestjs/config';
import { GmailEmailProvider } from '../src/email/gmail-email.provider';
import { RevealTokenService } from '../src/reveal/reveal-token.service';

async function main(): Promise<void> {
  const config = new ConfigService(process.env);
  const recipient =
    process.env.GMAIL_TEST_RECIPIENT ||
    config.getOrThrow<string>('GMAIL_SENDER_EMAIL');
  const provider = new GmailEmailProvider(config);
  const revealTokens = new RevealTokenService(config);
  const result = await provider.sendLetterAvailable({
    to: recipient,
    recipientName: 'PostDrop tester',
    letterTitle: 'PostDrop Gmail OAuth test',
    idempotencyKey: `gmail_smoke_${Date.now()}`,
    revealUrl: revealTokens.revealUrl(
      '00000000-0000-4000-8000-000000000009',
    ),
  });

  console.log(`Gmail accepted the test message: ${result.providerMessageId}`);
  console.log(`Recipient: ${recipient}`);
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'GMAIL_TEST_SEND_FAILED',
  );
  process.exitCode = 1;
});
