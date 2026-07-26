import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLetterAttachmentDto } from './create-letter-attachment.dto';

export class UpdateLetterAttachmentDto extends PartialType(
  OmitType(CreateLetterAttachmentDto, ['assetId'] as const),
) {}
