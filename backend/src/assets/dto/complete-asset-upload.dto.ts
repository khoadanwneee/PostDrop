import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CompleteAssetUploadDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20000)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20000)
  height?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400000)
  durationMs?: number;
}
