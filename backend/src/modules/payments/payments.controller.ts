import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  getPublicConfig() {
    return this.paymentsService.getPublicConfig();
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async initialize(
    @CurrentUser('id') buyerId: string,
    @CurrentUser('email') buyerEmail: string,
    @Body() dto: InitializePaymentDto,
  ) {
    return this.paymentsService.initializePayment(buyerId, buyerEmail, dto);
  }

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  async verify(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing x-paystack-signature header');
    }

    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(body);
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}
