import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCondition, ProductStatus } from '../schemas/product.schema';

export enum ProductSortBy {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  POPULAR = 'popular',
}

export class FilterProductsDto {
  @IsString()
  @IsOptional()
  q?: string; // Text search query

  @IsString()
  @IsOptional()
  category?: string; // Category ID or slug

  @IsString()
  @IsOptional()
  partBrand?: string; // PartBrand ID or slug

  @IsString()
  @IsOptional()
  vehicleBrand?: string; // VehicleBrand ID, slug, or name

  @IsString()
  @IsOptional()
  vehicleModel?: string; // Model name e.g. "Camry"

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  year?: number; // Year e.g. 2008

  @IsString()
  @IsOptional()
  engineNumber?: string; // Partial engine code e.g. "2GR" matches "2GR-FE"

  @IsString()
  @IsOptional()
  engineType?: string; // e.g. "V6" or "2.4L"

  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @IsString()
  @IsOptional()
  startDate?: string; // ISO date string

  @IsString()
  @IsOptional()
  endDate?: string; // ISO date string

  @IsEnum(ProductSortBy)
  @IsOptional()
  sort?: ProductSortBy = ProductSortBy.NEWEST;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsString()
  @IsOptional()
  supplier?: string;
}
