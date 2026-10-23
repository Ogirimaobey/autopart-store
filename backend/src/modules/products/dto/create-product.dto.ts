import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCondition, ProductStatus } from '../schemas/product.schema';

export class CompatibleVehicleDto {
  @IsString()
  @IsOptional()
  vehicleBrand?: string;

  @IsString()
  @IsNotEmpty()
  vehicleBrandName: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel: string;

  @IsNumber()
  @IsNotEmpty()
  yearStart: number;

  @IsNumber()
  @IsOptional()
  yearEnd?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  engineTypes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  engineNumbers?: string[];
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @IsString()
  @IsNotEmpty()
  category: string; // Category ObjectId or Slug

  @IsString()
  @IsNotEmpty()
  partBrand: string; // PartBrand ObjectId or Slug

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompatibleVehicleDto)
  @IsOptional()
  compatibleVehicles?: CompatibleVehicleDto[];

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsString()
  @IsOptional()
  partNumber?: string;
}
