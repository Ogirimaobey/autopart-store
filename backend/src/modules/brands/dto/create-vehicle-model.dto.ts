import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVehicleModelDto {
  @IsString()
  @IsNotEmpty()
  vehicleBrand: string; // brand ObjectId

  @IsString()
  @IsNotEmpty()
  name: string; // e.g. "Camry"

  @IsString()
  @IsOptional()
  slug?: string;

  @IsNumber()
  @IsNotEmpty()
  yearStart: number;

  @IsNumber()
  @IsOptional()
  yearEnd?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  popularEngineCodes?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateVehicleModelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsNumber()
  @IsOptional()
  yearStart?: number;

  @IsNumber()
  @IsOptional()
  yearEnd?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  popularEngineCodes?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
