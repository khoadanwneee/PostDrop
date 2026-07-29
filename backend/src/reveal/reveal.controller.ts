import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ExchangeRevealDto } from './dto/exchange-reveal.dto';
import { RevealContentDto } from './dto/reveal-content.dto';
import { RevealService } from './reveal.service';

@ApiTags('secure reveal')
@Controller('reveal')
export class RevealController {
  constructor(private readonly revealService: RevealService) {}

  @Post('exchange')
  @Header('Cache-Control', 'no-store, private, max-age=0')
  @Header('Pragma', 'no-cache')
  exchange(@Body() dto: ExchangeRevealDto) {
    return this.revealService.exchange(dto.letterId, dto.capabilityToken);
  }

  @Post('content')
  @ApiBearerAuth()
  @Header('Cache-Control', 'no-store, private, max-age=0')
  @Header('Pragma', 'no-cache')
  @Header('X-Content-Type-Options', 'nosniff')
  revealContent(
    @Body() dto: RevealContentDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.revealService.revealContent(dto.letterId, authorization);
  }

  @Get(':letterId/attachments/:attachmentId')
  @ApiBearerAuth()
  async revealAttachment(
    @Param('letterId') letterId: string,
    @Param('attachmentId') attachmentId: string,
    @Headers('authorization') authorization: string | undefined,
    @Res() response: Response,
  ) {
    const attachment = await this.revealService.revealAttachment(
      letterId,
      attachmentId,
      authorization,
    );
    response.set({
      'Cache-Control': 'no-store, private, max-age=0',
      Pragma: 'no-cache',
      'Content-Type': attachment.mimeType,
      'Content-Length': String(attachment.byteSize),
      'Content-Disposition': `inline; filename="${attachment.id}"`,
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(attachment.data);
  }
}
