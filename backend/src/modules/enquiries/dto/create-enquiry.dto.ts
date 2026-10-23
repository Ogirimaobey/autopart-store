import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnquiryDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  subject?: string;
}

export class ReplyEnquiryDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
