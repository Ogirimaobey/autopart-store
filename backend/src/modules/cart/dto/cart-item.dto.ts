import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
