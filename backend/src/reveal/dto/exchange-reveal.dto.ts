import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ExchangeRevealDto {
  @IsUUID()
  letterId!: string;

  @IsString()
  @MinLength(32)
  @MaxLength(256)
  capabilityToken!: string;
}
