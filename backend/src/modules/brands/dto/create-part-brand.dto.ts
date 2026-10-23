import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isOem?: boolean;

  @IsString()
  @IsOptional()
  countryOfOrigin?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePartBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isOem?: boolean;

  @IsString()
  @IsOptional()
  countryOfOrigin?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
