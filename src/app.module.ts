import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LettersModule } from './letters/letters.module';

@Module({
  imports: [LettersModule],
  controllers: [AppController],
})
export class AppModule {}
