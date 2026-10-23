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
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import {
  CreateVehicleBrandDto,
  UpdateVehicleBrandDto,
} from './dto/create-vehicle-brand.dto';
import {
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
} from './dto/create-vehicle-model.dto';
import {
  CreatePartBrandDto,
  UpdatePartBrandDto,
} from './dto/create-part-brand.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // ---------------- Vehicle Brands ----------------

  @Get('vehicles')
  async findAllVehicleBrands(@Query('all') all?: string) {
    return this.brandsService.findAllVehicleBrands(all !== 'true');
  }

  @Get('vehicles/:identifier')
  async findVehicleBrand(@Param('identifier') identifier: string) {
    return this.brandsService.findVehicleBrandBySlugOrId(identifier);
  }

  @Post('vehicles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createVehicleBrand(@Body() dto: CreateVehicleBrandDto) {
    return this.brandsService.createVehicleBrand(dto);
  }

  @Patch('vehicles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateVehicleBrand(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleBrandDto,
  ) {
    return this.brandsService.updateVehicleBrand(id, dto);
  }

  @Delete('vehicles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteVehicleBrand(@Param('id') id: string) {
    return this.brandsService.deleteVehicleBrand(id);
  }

  // ---------------- Vehicle Models ----------------

  @Get('vehicles/:brand/models')
  async findModelsByBrand(
    @Param('brand') brand: string,
    @Query('all') all?: string,
  ) {
    return this.brandsService.findModelsByBrand(brand, all !== 'true');
  }

  @Post('vehicles/models')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createVehicleModel(@Body() dto: CreateVehicleModelDto) {
    return this.brandsService.createVehicleModel(dto);
  }

  @Patch('vehicles/models/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateVehicleModel(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleModelDto,
  ) {
    return this.brandsService.updateVehicleModel(id, dto);
  }

  @Delete('vehicles/models/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteVehicleModel(@Param('id') id: string) {
    return this.brandsService.deleteVehicleModel(id);
  }

  // ---------------- Part Brands ----------------

  @Get('parts')
  async findAllPartBrands(
    @Query('all') all?: string,
    @Query('oem') oem?: string,
  ) {
    const isOem = oem !== undefined ? oem === 'true' : undefined;
    return this.brandsService.findAllPartBrands(all !== 'true', isOem);
  }

  @Get('parts/:identifier')
  async findPartBrand(@Param('identifier') identifier: string) {
    return this.brandsService.findPartBrandBySlugOrId(identifier);
  }

  @Post('parts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createPartBrand(@Body() dto: CreatePartBrandDto) {
    return this.brandsService.createPartBrand(dto);
  }

  @Patch('parts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updatePartBrand(
    @Param('id') id: string,
    @Body() dto: UpdatePartBrandDto,
  ) {
    return this.brandsService.updatePartBrand(id, dto);
  }

  @Delete('parts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deletePartBrand(@Param('id') id: string) {
    return this.brandsService.deletePartBrand(id);
  }
}
