import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BrandsService } from './brands.service';
import { VehicleBrand } from './schemas/vehicle-brand.schema';
import { VehicleModel } from './schemas/vehicle-model.schema';
import { PartBrand } from './schemas/part-brand.schema';

describe('BrandsService', () => {
  let service: BrandsService;
  let mockVehicleBrandModel: any;
  let mockVehicleModelModel: any;
  let mockPartBrandModel: any;

  beforeEach(async () => {
    mockVehicleBrandModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    mockVehicleModelModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      deleteMany: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    mockPartBrandModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        {
          provide: getModelToken(VehicleBrand.name),
          useValue: mockVehicleBrandModel,
        },
        {
          provide: getModelToken(VehicleModel.name),
          useValue: mockVehicleModelModel,
        },
        {
          provide: getModelToken(PartBrand.name),
          useValue: mockPartBrandModel,
        },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all active vehicle brands', async () => {
    const brands = [
      { name: 'Toyota', slug: 'toyota', isActive: true },
      { name: 'Honda', slug: 'honda', isActive: true },
    ];

    mockVehicleBrandModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(brands),
      }),
    });

    const result = await service.findAllVehicleBrands(true);
    expect(result).toHaveLength(2);
    expect(mockVehicleBrandModel.find).toHaveBeenCalledWith({ isActive: true });
  });

  it('should find part brands with OEM filter', async () => {
    const partBrands = [{ name: 'Denso', slug: 'denso', isOem: true }];

    mockPartBrandModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(partBrands),
      }),
    });

    const result = await service.findAllPartBrands(true, true);
    expect(result).toHaveLength(1);
    expect(mockPartBrandModel.find).toHaveBeenCalledWith({
      isActive: true,
      isOem: true,
    });
  });
});
