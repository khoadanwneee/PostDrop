import { IsDateString, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLetterDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  @MinLength(2)
  recipientName: string;

  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsDateString()
  deliveryDate: string;

  @IsIn(['email', 'physical', 'hybrid'])
  deliveryMethod: 'email' | 'physical' | 'hybrid';

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
