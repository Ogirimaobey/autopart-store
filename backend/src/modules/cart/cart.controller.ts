import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser('id') buyerId: string) {
    return this.cartService.getCart(buyerId);
  }

  @Post('items')
  async addItem(@CurrentUser('id') buyerId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(buyerId, dto);
  }

  @Patch('items')
  async updateItem(
    @CurrentUser('id') buyerId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(buyerId, dto);
  }

  @Delete('items/:productId')
  async removeItem(
    @CurrentUser('id') buyerId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(buyerId, productId);
  }

  @Delete()
  async clearCart(@CurrentUser('id') buyerId: string) {
    return this.cartService.clearCart(buyerId);
  }
}
