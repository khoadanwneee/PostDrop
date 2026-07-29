import { IsString, Length, Matches } from 'class-validator';

export class MockCheckoutTokenDto {
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/)
  token!: string;
}
