import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { LettersService } from './letters.service';

interface CurrentAuthValue {
  user: User;
  supabase: SupabaseClient;
}

@ApiTags('letters')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('letters')
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Get()
  findAll(@CurrentAuth() auth: CurrentAuthValue) {
    return this.lettersService.findAll(auth.supabase);
  }

  @Get('dashboard')
  dashboard(@CurrentAuth() auth: CurrentAuthValue) {
    return this.lettersService.dashboard(auth.supabase);
  }

  @Get(':id')
  findOne(@CurrentAuth() auth: CurrentAuthValue, @Param('id') id: string) {
    return this.lettersService.findOne(auth.supabase, id);
  }

  @Post()
  create(@CurrentAuth() auth: CurrentAuthValue, @Body() dto: CreateLetterDto) {
    return this.lettersService.create(auth.supabase, dto);
  }

  @Patch(':id')
  update(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('id') id: string,
    @Body() dto: UpdateLetterDto,
  ) {
    return this.lettersService.update(auth.supabase, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('id') id: string,
  ) {
    await this.lettersService.remove(auth.supabase, id);
  }

  @Post(':id/seal')
  seal(@CurrentAuth() auth: CurrentAuthValue, @Param('id') id: string) {
    return this.lettersService.seal(auth.supabase, auth.user.id, id);
  }
}
