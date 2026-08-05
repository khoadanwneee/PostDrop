import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLetterAttachmentDto {
  @IsUUID()
  assetId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientId?: string;

  @IsEnum(['decoration', 'inline', 'attachment', 'future_video'])
  role: 'decoration' | 'inline' | 'attachment' | 'future_video';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  x?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  y?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10)
  scale?: number;

  @IsOptional()
  @IsNumber()
  @Min(-360)
  @Max(360)
  rotation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  zIndex?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;
}
