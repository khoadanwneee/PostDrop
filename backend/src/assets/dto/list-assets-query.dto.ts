import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AssetKind } from '../asset-policy';

export class ListAssetsQueryDto {
  @IsOptional()
  @IsEnum(['sticker', 'image', 'video'])
  kind?: AssetKind;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}
