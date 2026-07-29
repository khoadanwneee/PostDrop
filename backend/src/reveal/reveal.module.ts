import { Module } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { RevealController } from './reveal.controller';
import { RevealService } from './reveal.service';
import { RevealTokenService } from './reveal-token.service';

@Module({
  imports: [EncryptionModule, AssetsModule],
  controllers: [RevealController],
  providers: [RevealService, RevealTokenService],
  exports: [RevealTokenService],
})
export class RevealModule {}
