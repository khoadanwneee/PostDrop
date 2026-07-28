import { Module } from '@nestjs/common';
import { EMAIL_PROVIDER } from './email-provider';
import { GmailEmailProvider } from './gmail-email.provider';

@Module({
  providers: [
    GmailEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      useExisting: GmailEmailProvider,
    },
  ],
  exports: [EMAIL_PROVIDER],
})
export class EmailModule {}
