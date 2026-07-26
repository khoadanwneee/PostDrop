import {
  IsEnum,
  IsInt,
  IsMimeType,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AssetKind, MAX_ASSET_BYTES } from '../asset-policy';

export class StartAssetUploadDto {
  @IsEnum(['sticker', 'image', 'video'])
  kind: AssetKind;

  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsMimeType()
  mimeType: string;

  @IsInt()
  @Min(1)
  @Max(MAX_ASSET_BYTES)
  byteSize: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}
