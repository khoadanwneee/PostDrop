import { IsUUID } from 'class-validator';

export class RevealContentDto {
  @IsUUID()
  letterId!: string;
}
