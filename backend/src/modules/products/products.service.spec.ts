import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  Product,
  ProductCondition,
  ProductStatus,
} from './schemas/product.schema';
import { Category } from '../categories/schemas/category.schema';
import { PartBrand } from '../brands/schemas/part-brand.schema';
import { VehicleBrand } from '../brands/schemas/vehicle-brand.schema';
import { ProductSortBy } from './dto/filter-products.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductModel: any;
  let mockCategoryModel: any;
  let mockPartBrandModel: any;
  let mockVehicleBrandModel: any;

  beforeEach(async () => {
    mockProductModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        ...dto,
      }),
    }));

    Object.assign(mockProductModel, {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    });

    mockCategoryModel = {
      findOne: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439001',
        name: 'Braking System',
        slug: 'braking-system',
      }),
    };

    mockPartBrandModel = {
      findOne: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439002',
        name: 'Bosch',
        slug: 'bosch',
      }),
    };

    mockVehicleBrandModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
        {
          provide: getModelToken(PartBrand.name),
          useValue: mockPartBrandModel,
        },
        {
          provide: getModelToken(VehicleBrand.name),
          useValue: mockVehicleBrandModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product listing with resolved category and part brand', async () => {
      const mockPopulatedProduct = {
        _id: '507f1f77bcf86cd799439099',
        title: 'Front Brake Pads',
        slug: 'front-brake-pads',
        price: 25000,
      };

      const chainMock: any = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPopulatedProduct),
      };
      mockProductModel.findById.mockReturnValue(chainMock);

      const result = await service.create('507f1f77bcf86cd799439011', {
        title: 'Front Brake Pads',
        description: 'High quality ceramic pads',
        price: 25000,
        stockQuantity: 10,
        condition: ProductCondition.NEW,
        category: 'braking-system',
        partBrand: 'bosch',
        compatibleVehicles: [
          {
            vehicleBrandName: 'Toyota',
            vehicleModel: 'Camry',
            yearStart: 2006,
            yearEnd: 2011,
            engineNumbers: ['2GR-FE', '2AZ-FE'],
          },
        ],
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Front Brake Pads');
    });
  });

  describe('findAll', () => {
    it('should query products with engine number regex and pagination', async () => {
      const mockList = [
        {
          _id: 'prod1',
          title: 'Camry Radiator',
          price: 45000,
        },
      ];

      mockProductModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockList),
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      mockProductModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const res = await service.findAll({
        engineNumber: '2GR',
        minPrice: 10000,
        maxPrice: 50000,
        sort: ProductSortBy.PRICE_ASC,
        page: 1,
        limit: 20,
      });

      expect(res.products).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(mockProductModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProductStatus.ACTIVE,
          price: { $gte: 10000, $lte: 50000 },
          $and: expect.arrayContaining([
            expect.objectContaining({
              'compatibleVehicles.engineNumbers': {
                $regex: expect.any(RegExp),
              },
            }),
          ]),
        }),
      );
    });
  });

  describe('update & delete authorization', () => {
    it('should disallow non-owners from updating a listing', async () => {
      const mockChain: any = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'prod1',
          supplier: { _id: 'owner-id' },
          slug: 'product-slug',
        }),
      };
      mockProductModel.findById.mockReturnValue(mockChain);

      await expect(
        service.update(
          'prod1',
          'different-supplier-id',
          { price: 30000 },
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any listing', async () => {
      const mockChain: any = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'prod1',
          supplier: { _id: 'owner-id' },
          slug: 'product-slug',
        }),
      };
      mockProductModel.findById.mockReturnValue(mockChain);

      const mockUpdateChain: any = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'prod1',
          price: 30000,
        }),
      };
      mockProductModel.findByIdAndUpdate.mockReturnValue(mockUpdateChain);

      const updated = await service.update(
        'prod1',
        'admin-id',
        { price: 30000 },
        true,
      );
      expect(updated).toBeDefined();
      expect(updated.price).toBe(30000);
    });
  });
});
