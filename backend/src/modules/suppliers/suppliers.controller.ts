import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { UpdateSupplierProfileDto } from './dto/update-supplier-profile.dto';
import { ReviewSupplierDto } from './dto/review-supplier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('directory')
  async getDirectory(
    @Query('state') state?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.suppliersService.findPublicDirectory({
      state,
      search,
      page,
      limit,
    });
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.suppliersService.findByUserId(userId);
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateSupplierProfileDto,
  ) {
    return this.suppliersService.updateProfile(userId, updateDto);
  }

  @Get(':id')
  async getSupplierById(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(
    @Query('status') status?: string,
    @Query('verified') verified?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.suppliersService.findAll({
      status,
      verified,
      search,
      page,
      limit,
    });
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reviewSupplier(
    @Param('id') id: string,
    @Body() reviewDto: ReviewSupplierDto,
  ) {
    return this.suppliersService.reviewSupplier(id, reviewDto);
  }
}
