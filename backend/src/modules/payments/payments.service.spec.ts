import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { Payment, PaymentRecordStatus } from './schemas/payment.schema';
import { OrdersService } from '../orders/orders.service';
import * as crypto from 'crypto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentModel: any;
  let mockOrdersService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockPaymentModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        _id: 'pay-123',
        ...dto,
      }),
    }));

    Object.assign(mockPaymentModel, {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    });

    mockOrdersService = {
      findByCheckoutSessionId: jest.fn(),
      markOrdersAsPaid: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'PAYSTACK_SECRET_KEY') return 'sk_test_mock_secret_key';
        if (key === 'PAYSTACK_PUBLIC_KEY') return 'pk_test_mock_public_key';
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getModelToken(Payment.name),
          useValue: mockPaymentModel,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize payment with kobo amount calculation', async () => {
    const mockOrders = [
      {
        _id: 'ord-1',
        buyer: 'buyer-1',
        totalAmount: 25000,
        paymentStatus: 'pending',
        orderNumber: 'ORD-123',
      },
    ];

    mockOrdersService.findByCheckoutSessionId.mockResolvedValue(mockOrders);

    const result = await service.initializePayment(
      'buyer-1',
      'buyer@test.com',
      {
        checkoutSessionId: 'cs-test-123',
      },
    );

    expect(result.status).toBe(true);
    expect(result.amount).toBe(25000);
    expect(result.reference).toBeDefined();
    expect(result.authorizationUrl).toBeDefined();
  });

  it('should verify payment and mark orders as paid', async () => {
    const mockPayment: any = {
      _id: 'pay-1',
      reference: 'pst_123',
      checkoutSessionId: 'cs-test-123',
      amount: 25000,
      status: PaymentRecordStatus.PENDING,
      save: jest.fn().mockResolvedValue(true),
    };

    const mockOrders = [
      {
        _id: 'ord-1',
        status: 'paid',
        paymentStatus: 'paid',
      },
    ];

    mockPaymentModel.findOne.mockResolvedValue(mockPayment);
    mockOrdersService.markOrdersAsPaid.mockResolvedValue(mockOrders);

    const result = await service.verifyPayment('pst_123');

    expect(result.verified).toBe(true);
    expect(mockPayment.status).toBe(PaymentRecordStatus.SUCCESS);
    expect(mockOrdersService.markOrdersAsPaid).toHaveBeenCalledWith(
      'cs-test-123',
      'pst_123',
    );
  });

  it('should verify webhook signature and handle charge.success', async () => {
    const secretKey = 'sk_test_mock_secret_key';
    const payload = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: 'pst_test_ref',
        metadata: {
          checkoutSessionId: 'cs_webhook_123',
        },
        channel: 'card',
      },
    });

    const signature = crypto
      .createHmac('sha512', secretKey)
      .update(payload)
      .digest('hex');

    const result = await service.handleWebhook(payload, signature);

    expect(result.received).toBe(true);
    expect(mockOrdersService.markOrdersAsPaid).toHaveBeenCalledWith(
      'cs_webhook_123',
      'pst_test_ref',
    );
  });
});
