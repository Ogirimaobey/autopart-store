import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';
import { Enquiry, EnquiryStatus } from './schemas/enquiry.schema';
import { Product } from '../products/schemas/product.schema';

describe('EnquiriesService', () => {
  let service: EnquiriesService;
  let mockEnquiryModel: any;
  let mockProductModel: any;

  beforeEach(async () => {
    mockEnquiryModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        ...dto,
        populate: jest.fn().mockResolvedValue({
          _id: 'enq-123',
          ...dto,
        }),
      }),
    }));

    Object.assign(mockEnquiryModel, {
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
    });

    mockProductModel = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnquiriesService,
        {
          provide: getModelToken(Enquiry.name),
          useValue: mockEnquiryModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<EnquiriesService>(EnquiriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an enquiry on a product', async () => {
    mockProductModel.findById.mockResolvedValue({
      _id: 'prod-1',
      title: 'Toyota Camry Alternator',
      supplier: { _id: 'supp-1' },
    });

    const result = await service.create('buyer-1', {
      productId: 'prod-1',
      message: 'Does this fit engine number 2GR-FE?',
    });

    expect(result).toBeDefined();
    expect(result.subject).toContain('Toyota Camry Alternator');
  });

  it('should allow supplier to reply and change status to responded', async () => {
    const mockEnquiry: any = {
      _id: 'enq-1',
      buyer: 'buyer-1',
      supplier: 'supp-1',
      status: EnquiryStatus.OPEN,
      messages: [],
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue({
        _id: 'enq-1',
        status: EnquiryStatus.RESPONDED,
      }),
    };

    mockEnquiryModel.findById.mockResolvedValue(mockEnquiry);

    await service.reply('enq-1', 'supp-1', {
      message: 'Yes, this is 100% compatible with 2GR-FE V6 engine.',
    });

    expect(mockEnquiry.status).toBe(EnquiryStatus.RESPONDED);
    expect(mockEnquiry.messages).toHaveLength(1);
  });

  it('should prevent unauthorized third party from replying to enquiry', async () => {
    const mockEnquiry: any = {
      _id: 'enq-1',
      buyer: 'buyer-1',
      supplier: 'supp-1',
    };

    mockEnquiryModel.findById.mockResolvedValue(mockEnquiry);

    await expect(
      service.reply('enq-1', 'random-user-id', { message: 'hi' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
