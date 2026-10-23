import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { Product, ProductStatus } from '../products/schemas/product.schema';

describe('CartService', () => {
  let service: CartService;
  let mockCartModel: any;
  let mockProductModel: any;

  beforeEach(async () => {
    mockCartModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    mockProductModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should group cart items by supplier and calculate totals', async () => {
    const mockCart = {
      _id: 'cart-1',
      buyer: 'buyer-1',
      items: [
        {
          product: {
            _id: 'prod-1',
            title: 'Brake Pads',
            slug: 'brake-pads',
            price: 25000,
            discountPrice: 20000,
            stockQuantity: 10,
            status: ProductStatus.ACTIVE,
          },
          supplier: {
            _id: 'supp-1',
            fullName: 'Ladipo Spares',
            email: 'ladipo@test.com',
          },
          quantity: 2,
        },
        {
          product: {
            _id: 'prod-2',
            title: 'Alternator',
            slug: 'alternator',
            price: 60000,
            stockQuantity: 5,
            status: ProductStatus.ACTIVE,
          },
          supplier: {
            _id: 'supp-2',
            fullName: 'Ikeja Auto Parts',
            email: 'ikeja@test.com',
          },
          quantity: 1,
        },
      ],
    };

    mockCartModel.findOne.mockResolvedValue(mockCart);
    mockCartModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCart),
        }),
      }),
    });

    const result = await service.getCart('buyer-1');

    expect(result.supplierGroups).toHaveLength(2);
    expect(result.totalItems).toBe(3);
    // (20000 * 2) + (60000 * 1) = 100,000
    expect(result.grandTotal).toBe(100000);
    expect(result.supplierGroups[0].supplier.fullName).toBe('Ladipo Spares');
    expect(result.supplierGroups[0].supplierSubtotal).toBe(40000);
  });
});
