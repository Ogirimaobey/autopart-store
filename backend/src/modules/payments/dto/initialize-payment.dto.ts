import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InitializePaymentDto {
  @IsString()
  @IsNotEmpty()
  checkoutSessionId: string;

  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
