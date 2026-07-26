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
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { AssetsService } from './assets.service';
import { CreateLetterAttachmentDto } from './dto/create-letter-attachment.dto';
import { UpdateLetterAttachmentDto } from './dto/update-letter-attachment.dto';

interface CurrentAuthValue {
  supabase: SupabaseClient;
}

@ApiTags('letter attachments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('letters/:letterId/attachments')
export class LetterAttachmentsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('letterId') letterId: string,
  ) {
    return this.assetsService.listLetterAttachments(auth.supabase, letterId);
  }

  @Post()
  create(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('letterId') letterId: string,
    @Body() dto: CreateLetterAttachmentDto,
  ) {
    return this.assetsService.createLetterAttachment(
      auth.supabase,
      letterId,
      dto,
    );
  }

  @Patch(':attachmentId')
  update(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('letterId') letterId: string,
    @Param('attachmentId') attachmentId: string,
    @Body() dto: UpdateLetterAttachmentDto,
  ) {
    return this.assetsService.updateLetterAttachment(
      auth.supabase,
      letterId,
      attachmentId,
      dto,
    );
  }

  @Delete(':attachmentId')
  @HttpCode(204)
  async remove(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('letterId') letterId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    await this.assetsService.removeLetterAttachment(
      auth.supabase,
      letterId,
      attachmentId,
    );
  }
}
