import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { LetterAttachmentsController } from './letter-attachments.controller';
import { SealedAttachmentsService } from './sealed-attachments.service';

@Module({
  imports: [AuthModule, EncryptionModule],
  controllers: [AssetsController, LetterAttachmentsController],
  providers: [AssetsService, SealedAttachmentsService],
  exports: [SealedAttachmentsService],
})
export class AssetsModule {}
