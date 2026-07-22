import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { LettersService } from './letters.service';

@Controller('letters')
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Get()
  findAll() { return this.lettersService.findAll(); }

  @Get('dashboard')
  dashboard() { return this.lettersService.dashboard(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.lettersService.findOne(id); }

  @Post()
  create(@Body() dto: CreateLetterDto) { return this.lettersService.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLetterDto) {
    return this.lettersService.update(id, dto);
  }

  @Post(':id/seal')
  seal(@Param('id') id: string) { return this.lettersService.seal(id); }
}
