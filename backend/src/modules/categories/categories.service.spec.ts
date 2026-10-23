import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockCategoryModel: any;

  beforeEach(async () => {
    mockCategoryModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all active categories by default', async () => {
    const mockCategories = [
      { name: 'Braking System', slug: 'braking-system', isActive: true },
      { name: 'Engine Parts', slug: 'engine-parts', isActive: true },
    ];

    mockCategoryModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCategories),
        }),
      }),
    });

    const result = await service.findAll(true);
    expect(result).toHaveLength(2);
    expect(mockCategoryModel.find).toHaveBeenCalledWith({ isActive: true });
  });

  it('should find category by slug', async () => {
    const mockCategory = { name: 'Engine Parts', slug: 'engine-parts' };

    mockCategoryModel.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      }),
    });

    const result = await service.findBySlug('engine-parts');
    expect(result.name).toBe('Engine Parts');
    expect(mockCategoryModel.findOne).toHaveBeenCalledWith({
      slug: 'engine-parts',
    });
  });
});
