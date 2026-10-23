import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  Payment,
  PaymentDocument,
  PaymentRecordStatus,
} from './schemas/payment.schema';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus } from '../orders/schemas/order.schema';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  async initializePayment(
    buyerId: string,
    buyerEmail: string,
    dto: InitializePaymentDto,
  ) {
    const orders = await this.ordersService.findByCheckoutSessionId(
      dto.checkoutSessionId,
    );
    if (!orders || orders.length === 0) {
      throw new NotFoundException('No orders found for this checkout session');
    }

    // Verify buyer ownership
    for (const order of orders) {
      const orderBuyerId =
        (order.buyer as any)?._id?.toString() || order.buyer.toString();
      if (orderBuyerId !== buyerId) {
        throw new BadRequestException(
          'You are not authorized to pay for these orders',
        );
      }
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestException(
          'Orders for this checkout session have already been paid',
        );
      }
    }

    const totalAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const amountKobo = Math.round(totalAmount * 100);
    const reference = `pst_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const callbackUrl = dto.callbackUrl || `${frontendUrl}/checkout/callback`;

    // Save pending payment record
    const payment = new this.paymentModel({
      reference,
      checkoutSessionId: dto.checkoutSessionId,
      buyer: buyerId,
      amount: totalAmount,
      amountKobo,
      currency: 'NGN',
      status: PaymentRecordStatus.PENDING,
    });
    await payment.save();

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const isMockKey = !secretKey || secretKey.includes('mock');

    // If real Paystack secret key is provided, initialize transaction with Paystack API
    if (!isMockKey) {
      try {
        const response = await fetch(
          'https://api.paystack.co/transaction/initialize',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: buyerEmail,
              amount: amountKobo,
              reference,
              callback_url: callbackUrl,
              metadata: {
                checkoutSessionId: dto.checkoutSessionId,
                buyerId,
                orderNumbers: orders.map((o) => o.orderNumber),
              },
            }),
          },
        );

        const data = await response.json();
        if (!response.ok || !data.status) {
          this.logger.error(`Paystack initialization failed: ${data.message}`);
          throw new BadRequestException(
            data.message || 'Payment initialization failed',
          );
        }

        return {
          status: true,
          message: 'Authorization URL created',
          authorizationUrl: data.data.authorization_url,
          accessCode: data.data.access_code,
          reference,
          amount: totalAmount,
          checkoutSessionId: dto.checkoutSessionId,
        };
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.error(`Error connecting to Paystack: ${err.message}`);
      }
    }

    // Dev/Mock Fallback Mode: Provides a working callback redirect for rapid local testing
    return {
      status: true,
      message: 'Authorization URL created (development mode)',
      authorizationUrl: `${callbackUrl}?reference=${reference}&trxref=${reference}`,
      accessCode: `mock_acc_${reference}`,
      reference,
      amount: totalAmount,
      checkoutSessionId: dto.checkoutSessionId,
    };
  }

  async verifyPayment(reference: string) {
    const payment = await this.paymentModel.findOne({ reference });
    if (!payment) {
      throw new NotFoundException(
        `Payment record with reference ${reference} not found`,
      );
    }

    // Idempotent check: if already marked success
    if (payment.status === PaymentRecordStatus.SUCCESS) {
      const orders = await this.ordersService.findByCheckoutSessionId(
        payment.checkoutSessionId,
      );
      return {
        verified: true,
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        checkoutSessionId: payment.checkoutSessionId,
        orders,
      };
    }

    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const isMockKey = !secretKey || secretKey.includes('mock');

    let paymentSuccess = false;
    let channel = 'card';
    let gatewayResponse: any = { status: 'success' };

    if (!isMockKey) {
      try {
        const response = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${secretKey}`,
            },
          },
        );

        const data = await response.json();
        if (data.status && data.data.status === 'success') {
          paymentSuccess = true;
          channel = data.data.channel;
          gatewayResponse = data.data;
        } else {
          payment.status = PaymentRecordStatus.FAILED;
          payment.gatewayResponse = data;
          await payment.save();
          return {
            verified: false,
            message:
              data.data?.gateway_response || 'Payment verification failed',
          };
        }
      } catch (err: any) {
        this.logger.error(`Paystack verify API call error: ${err.message}`);
        throw new BadRequestException(
          'Could not verify transaction with Paystack',
        );
      }
    } else {
      // In dev/mock mode, automatically verify
      paymentSuccess = true;
      channel = 'mock_card';
    }

    if (paymentSuccess) {
      payment.status = PaymentRecordStatus.SUCCESS;
      payment.channel = channel;
      payment.gatewayResponse = gatewayResponse;
      payment.paidAt = new Date();
      await payment.save();

      // Mark all corresponding orders as paid and decrement stock
      const updatedOrders = await this.ordersService.markOrdersAsPaid(
        payment.checkoutSessionId,
        reference,
      );

      return {
        verified: true,
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        checkoutSessionId: payment.checkoutSessionId,
        orders: updatedOrders,
      };
    }

    return { verified: false, message: 'Payment verification failed' };
  }

  async handleWebhook(rawBody: string, signature: string) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('Paystack secret key is not configured');
    }

    // Verify HMAC-SHA512 signature
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      this.logger.warn('Paystack webhook signature verification failed');
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const { reference, metadata, channel } = event.data;
      const checkoutSessionId = metadata?.checkoutSessionId;

      this.logger.log(
        `Received successful payment webhook for reference: ${reference}`,
      );

      if (checkoutSessionId) {
        await this.ordersService.markOrdersAsPaid(checkoutSessionId, reference);

        await this.paymentModel.findOneAndUpdate(
          { reference },
          {
            $set: {
              status: PaymentRecordStatus.SUCCESS,
              channel,
              gatewayResponse: event.data,
              paidAt: new Date(),
            },
          },
          { upsert: false },
        );
      }
    }

    return { received: true };
  }

  getPublicConfig() {
    return {
      publicKey:
        this.configService.get<string>('PAYSTACK_PUBLIC_KEY') ||
        'pk_test_mock_public_key',
    };
  }
}
