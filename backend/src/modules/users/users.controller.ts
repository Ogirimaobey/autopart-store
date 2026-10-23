import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({ role, status, page, limit });
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'pending' | 'suspended',
  ) {
    return this.usersService.updateStatus(id, status);
  }
}
