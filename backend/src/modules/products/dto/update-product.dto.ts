import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCondition, ProductStatus } from '../schemas/product.schema';
import { CompatibleVehicleDto } from './create-product.dto';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  partBrand?: string;

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
