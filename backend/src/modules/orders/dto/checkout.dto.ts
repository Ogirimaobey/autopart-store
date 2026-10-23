import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType, OrderStatus } from '../schemas/order.schema';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsOptional()
  country?: string = 'Nigeria';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CheckoutDto {
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsEnum(DeliveryType)
  @IsOptional()
  deliveryType?: DeliveryType = DeliveryType.SHIPPING;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  supplierNotes?: string;
}
