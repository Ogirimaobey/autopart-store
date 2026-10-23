import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { ProductStatus } from './schemas/product.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() filterDto: FilterProductsDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get('supplier/my-listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  async getMyListings(
    @CurrentUser('id') supplierId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findSupplierListings(supplierId, {
      status,
      page,
      limit,
    });
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    return this.productsService.findByIdOrSlug(identifier);
  }

  @Get(':identifier/related')
  async findRelated(
    @Param('identifier') identifier: string,
    @Query('limit') limit?: number,
  ) {
    const product = await this.productsService.findByIdOrSlug(identifier);
    return this.productsService.findRelated(
      product._id.toString(),
      limit ? Number(limit) : 4,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') supplierId: string,
    @Body() createDto: CreateProductDto,
  ) {
    return this.productsService.create(supplierId, createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDto: UpdateProductDto,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    return this.productsService.update(
      id,
      user._id.toString(),
      updateDto,
      isAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER, Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isAdmin = user.role === Role.ADMIN;
    return this.productsService.delete(id, user._id.toString(), isAdmin);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async moderate(
    @Param('id') id: string,
    @Body('status') status: ProductStatus,
  ) {
    return this.productsService.moderate(id, status);
  }
}
