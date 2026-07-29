import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/environment';
import { EncryptionModule } from './encryption/encryption.module';
import { LettersModule } from './letters/letters.module';
import { PaymentsModule } from './payments/payments.module';
import { RevealModule } from './reveal/reveal.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    SupabaseModule,
    EncryptionModule,
    AuthModule,
    LettersModule,
    AssetsModule,
    PaymentsModule,
    RevealModule,
    SchedulingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
