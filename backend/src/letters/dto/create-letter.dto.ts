import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
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
  recipientEmail: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate: string;

  @IsOptional()
  @IsString()
  deliveryTimezone?: string;

  @IsOptional()
  @IsIn(['email', 'physical', 'hybrid'])
  deliveryMethod: 'email' | 'physical' | 'hybrid';

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
}
