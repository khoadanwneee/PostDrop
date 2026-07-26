import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { AssetsService } from './assets.service';
import { CompleteAssetUploadDto } from './dto/complete-asset-upload.dto';
import { ListAssetsQueryDto } from './dto/list-assets-query.dto';
import { StartAssetUploadDto } from './dto/start-asset-upload.dto';

interface CurrentAuthValue {
  user: User;
  supabase: SupabaseClient;
}

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('built-in')
  listBuiltIn(@Query() query: ListAssetsQueryDto) {
    return this.assetsService.listBuiltIn(query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('mine')
  listMine(
    @CurrentAuth() auth: CurrentAuthValue,
    @Query() query: ListAssetsQueryDto,
  ) {
    return this.assetsService.listMine(auth.supabase, query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('uploads')
  startUpload(
    @CurrentAuth() auth: CurrentAuthValue,
    @Body() dto: StartAssetUploadDto,
  ) {
    return this.assetsService.startUpload(auth.supabase, auth.user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':id/complete')
  completeUpload(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('id') id: string,
    @Body() dto: CompleteAssetUploadDto,
  ) {
    return this.assetsService.completeUpload(auth.supabase, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(
    @CurrentAuth() auth: CurrentAuthValue,
    @Param('id') id: string,
  ) {
    await this.assetsService.removeAsset(auth.supabase, id);
  }
}
