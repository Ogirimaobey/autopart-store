import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, ReplyEnquiryDto } from './dto/create-enquiry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('enquiries')
@UseGuards(JwtAuthGuard)
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  async create(
    @CurrentUser('id') buyerId: string,
    @Body() dto: CreateEnquiryDto,
  ) {
    return this.enquiriesService.create(buyerId, dto);
  }

  @Get('buyer')
  async getBuyerEnquiries(
    @CurrentUser('id') buyerId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.enquiriesService.findBuyerEnquiries(buyerId, {
      status,
      page,
      limit,
    });
  }

  @Get('supplier')
  async getSupplierEnquiries(
    @CurrentUser('id') supplierId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.enquiriesService.findSupplierEnquiries(supplierId, {
      status,
      page,
      limit,
    });
  }

  @Get(':id')
  async getEnquiry(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.enquiriesService.findById(id, userId);
  }

  @Post(':id/reply')
  async reply(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReplyEnquiryDto,
  ) {
    return this.enquiriesService.reply(id, userId, dto);
  }

  @Patch(':id/close')
  async close(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.enquiriesService.close(id, userId);
  }
}
