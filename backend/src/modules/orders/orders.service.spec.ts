import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentStatus } from './schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { CartService } from '../cart/cart.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderModel: any;
  let mockProductModel: any;
  let mockCartService: any;

  beforeEach(async () => {
    mockOrderModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        _id: 'ord-123',
        ...dto,
      }),
    }));

    Object.assign(mockOrderModel, {
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
    });

    mockProductModel = {
      findById: jest.fn(),
    };

    mockCartService = {
      getCart: jest.fn(),
      clearCart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create individual orders per supplier from multi-supplier cart', async () => {
    mockCartService.getCart.mockResolvedValue({
      totalItems: 3,
      grandTotal: 100000,
      supplierGroups: [
        {
          supplier: { id: 'supp-1', fullName: 'Ladipo Spares' },
          supplierSubtotal: 40000,
          items: [
            {
              product: {
                id: 'prod-1',
                title: 'Brake Pads',
                slug: 'brake-pads',
                effectivePrice: 20000,
                stockQuantity: 10,
              },
              quantity: 2,
              subtotal: 40000,
              inStock: true,
            },
          ],
        },
        {
          supplier: { id: 'supp-2', fullName: 'Ikeja Auto Parts' },
          supplierSubtotal: 60000,
          items: [
            {
              product: {
                id: 'prod-2',
                title: 'Alternator',
                slug: 'alternator',
                effectivePrice: 60000,
                stockQuantity: 5,
              },
              quantity: 1,
              subtotal: 60000,
              inStock: true,
            },
          ],
        },
      ],
    });

    const result = await service.checkout('buyer-1', {
      shippingAddress: {
        fullName: 'John Buyer',
        phone: '+2348011111111',
        street: '10 Marina Street',
        city: 'Lagos Island',
        state: 'Lagos',
        country: 'Nigeria',
      },
    });

    expect(result.checkoutSessionId).toBeDefined();
    expect(result.orders).toHaveLength(2);
    expect(result.totalAmount).toBe(100000);
    expect(mockCartService.clearCart).toHaveBeenCalledWith('buyer-1');
  });

  it('should mark orders as paid and decrement stock quantity', async () => {
    const mockOrder: any = {
      _id: 'ord-1',
      checkoutSessionId: 'cs-test-123',
      paymentStatus: PaymentStatus.PENDING,
      statusHistory: [],
      items: [{ product: 'prod-1', quantity: 2 }],
      save: jest.fn().mockResolvedValue(true),
    };

    const mockProduct: any = {
      _id: 'prod-1',
      stockQuantity: 10,
      salesCount: 5,
      save: jest.fn().mockResolvedValue(true),
    };

    mockOrderModel.find.mockResolvedValue([mockOrder]);
    mockProductModel.findById.mockResolvedValue(mockProduct);

    await service.markOrdersAsPaid('cs-test-123', 'pay_ref_456');

    expect(mockOrder.status).toBe(OrderStatus.PAID);
    expect(mockOrder.paymentStatus).toBe(PaymentStatus.PAID);
    expect(mockProduct.stockQuantity).toBe(8); // 10 - 2
    expect(mockProduct.salesCount).toBe(7); // 5 + 2
    expect(mockProduct.save).toHaveBeenCalled();
  });
});
