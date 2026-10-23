import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Enquiry,
  EnquiryDocument,
  EnquiryStatus,
} from './schemas/enquiry.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateEnquiryDto, ReplyEnquiryDto } from './dto/create-enquiry.dto';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(Enquiry.name) private enquiryModel: Model<EnquiryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(
    buyerId: string,
    dto: CreateEnquiryDto,
  ): Promise<EnquiryDocument> {
    const product = await this.productModel.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const supplierId = (product.supplier as any)?._id
      ? (product.supplier as any)._id.toString()
      : product.supplier.toString();

    const enquiry = new this.enquiryModel({
      buyer: buyerId,
      supplier: supplierId,
      product: product._id,
      subject: dto.subject || `Enquiry regarding: ${product.title}`,
      status: EnquiryStatus.OPEN,
      messages: [
        {
          sender: buyerId,
          message: dto.message,
          createdAt: new Date(),
        },
      ],
      lastMessageAt: new Date(),
    });

    return (await enquiry.save()).populate([
      { path: 'product', select: 'title slug images price partNumber' },
      { path: 'supplier', select: 'fullName email phone' },
      { path: 'buyer', select: 'fullName email phone' },
    ]);
  }

  async reply(
    enquiryId: string,
    userId: string,
    dto: ReplyEnquiryDto,
  ): Promise<EnquiryDocument> {
    const enquiry = await this.enquiryModel.findById(enquiryId);
    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    const buyerId = enquiry.buyer.toString();
    const supplierId = enquiry.supplier.toString();

    if (userId !== buyerId && userId !== supplierId) {
      throw new ForbiddenException(
        'You are not authorized to reply to this enquiry thread',
      );
    }

    // Determine status transition
    let newStatus = enquiry.status;
    if (userId === supplierId) {
      newStatus = EnquiryStatus.RESPONDED;
    } else if (
      userId === buyerId &&
      enquiry.status === EnquiryStatus.RESPONDED
    ) {
      newStatus = EnquiryStatus.OPEN;
    }

    enquiry.messages.push({
      sender: userId as any,
      message: dto.message,
      createdAt: new Date(),
    });

    enquiry.status = newStatus;
    enquiry.lastMessageAt = new Date();

    await enquiry.save();

    return enquiry.populate([
      { path: 'product', select: 'title slug images price partNumber' },
      { path: 'supplier', select: 'fullName email phone' },
      { path: 'buyer', select: 'fullName email phone' },
      { path: 'messages.sender', select: 'fullName role' },
    ]);
  }

  async findBuyerEnquiries(
    buyerId: string,
    query: { status?: string; page?: number; limit?: number },
  ) {
    const filter: any = { buyer: buyerId };
    if (query.status) filter.status = query.status;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      this.enquiryModel
        .find(filter)
        .populate('product', 'title slug images price partNumber')
        .populate('supplier', 'fullName email phone')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.enquiryModel.countDocuments(filter).exec(),
    ]);

    return { enquiries, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findSupplierEnquiries(
    supplierId: string,
    query: { status?: string; page?: number; limit?: number },
  ) {
    const filter: any = { supplier: supplierId };
    if (query.status) filter.status = query.status;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      this.enquiryModel
        .find(filter)
        .populate('product', 'title slug images price partNumber')
        .populate('buyer', 'fullName email phone')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.enquiryModel.countDocuments(filter).exec(),
    ]);

    return { enquiries, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, userId: string): Promise<EnquiryDocument> {
    const enquiry = await this.enquiryModel
      .findById(id)
      .populate(
        'product',
        'title slug images price stockQuantity partNumber compatibleVehicles',
      )
      .populate('supplier', 'fullName email phone')
      .populate('buyer', 'fullName email phone')
      .populate('messages.sender', 'fullName role')
      .exec();

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    const buyerId = (enquiry.buyer as any)?._id
      ? (enquiry.buyer as any)._id.toString()
      : enquiry.buyer.toString();
    const supplierId = (enquiry.supplier as any)?._id
      ? (enquiry.supplier as any)._id.toString()
      : enquiry.supplier.toString();

    if (userId !== buyerId && userId !== supplierId) {
      throw new ForbiddenException(
        'You are not authorized to view this enquiry thread',
      );
    }

    return enquiry;
  }

  async close(id: string, userId: string): Promise<EnquiryDocument> {
    const enquiry = await this.findById(id, userId);
    enquiry.status = EnquiryStatus.CLOSED;
    return enquiry.save();
  }
}
