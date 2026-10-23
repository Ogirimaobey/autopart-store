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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    const activeOnly = all !== 'true';
    return this.categoriesService.findAll(activeOnly);
  }

  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string) {
    // If it looks like a Mongo ObjectId, query by ID; otherwise by slug
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      return this.categoriesService.findById(identifier);
    }
    return this.categoriesService.findBySlug(identifier);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createDto: CreateCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
