import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { LetterAttachmentsController } from './letter-attachments.controller';

@Module({
  imports: [AuthModule],
  controllers: [AssetsController, LetterAttachmentsController],
  providers: [AssetsService],
})
export class AssetsModule {}
