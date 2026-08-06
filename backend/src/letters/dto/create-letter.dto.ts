import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsObject,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateLetterDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content: string;

  @IsOptional()
  @IsString()
  recipientName: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  expectedArrivalAt: string;

  @IsOptional()
  @IsString()
  deliveryTimezone?: string;

  @IsOptional()
  @IsIn(['digital', 'physical'])
  deliveryMethod: 'digital' | 'physical';

  @ValidateIf(
    (dto: CreateLetterDto) =>
      dto.deliveryMethod === 'physical' ||
      dto.physicalFulfillmentMode !== undefined,
  )
  @IsIn(['print_design', 'stored_original'])
  physicalFulfillmentMode?: 'print_design' | 'stored_original';

  @IsOptional()
  @IsIn(['online', 'handwritten'])
  letterType: 'online' | 'handwritten';

  @IsOptional()
  @IsString()
  paper?: string;

  @IsOptional()
  @IsString()
  font?: string;

  @IsOptional()
  @IsString()
  envelope?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsObject()
  presentationSnapshot?: Record<string, unknown>;
}
