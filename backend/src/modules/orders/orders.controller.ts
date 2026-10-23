import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkout(@CurrentUser('id') buyerId: string, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(buyerId, dto);
  }

  @Get('buyer')
  async getBuyerOrders(
    @CurrentUser('id') buyerId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findBuyerOrders(buyerId, { status, page, limit });
  }

  @Get('supplier')
  @Roles(Role.SUPPLIER, Role.ADMIN)
  async getSupplierOrders(
    @CurrentUser('id') supplierId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findSupplierOrders(supplierId, {
      status,
      page,
      limit,
    });
  }

  @Get('session/:sessionId')
  async getBySession(@Param('sessionId') sessionId: string) {
    return this.ordersService.findByCheckoutSessionId(sessionId);
  }

  @Get()
  @Roles(Role.ADMIN)
  async getAllOrders(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findAll({ status, page, limit });
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findById(id, user._id.toString(), user.role);
  }

  @Patch(':id/status')
  @Roles(Role.SUPPLIER, Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      id,
      user._id.toString(),
      user.role,
      dto,
    );
  }
}
