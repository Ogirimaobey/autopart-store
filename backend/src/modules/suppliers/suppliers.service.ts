import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SupplierProfile,
  SupplierProfileDocument,
} from './schemas/supplier-profile.schema';
import { CreateSupplierProfileDto } from './dto/create-supplier-profile.dto';
import { UpdateSupplierProfileDto } from './dto/update-supplier-profile.dto';
import { ReviewSupplierDto } from './dto/review-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(SupplierProfile.name)
    private supplierProfileModel: Model<SupplierProfileDocument>,
  ) {}

  async createProfile(
    userId: string,
    createSupplierProfileDto: CreateSupplierProfileDto,
  ): Promise<SupplierProfileDocument> {
    const existing = await this.supplierProfileModel.findOne({ user: userId });
    if (existing) {
      throw new ConflictException(
        'Supplier profile already exists for this account',
      );
    }

    const profile = new this.supplierProfileModel({
      user: userId,
      ...createSupplierProfileDto,
      approvalStatus: 'pending',
      verifiedBadge: false,
    });

    return profile.save();
  }

  async findByUserId(userId: string): Promise<SupplierProfileDocument | null> {
    return this.supplierProfileModel
      .findOne({ user: userId })
      .populate('user', 'fullName email phone avatarUrl status')
      .exec();
  }

  async findById(id: string): Promise<SupplierProfileDocument> {
    const profile = await this.supplierProfileModel
      .findById(id)
      .populate('user', 'fullName email phone avatarUrl status')
      .exec();
    if (!profile) {
      throw new NotFoundException('Supplier profile not found');
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateSupplierProfileDto,
  ): Promise<SupplierProfileDocument> {
    const profile = await this.supplierProfileModel
      .findOneAndUpdate({ user: userId }, { $set: updateDto }, { new: true })
      .populate('user', 'fullName email phone avatarUrl status')
      .exec();

    if (!profile) {
      throw new NotFoundException('Supplier profile not found');
    }
    return profile;
  }

  async reviewSupplier(
    id: string,
    reviewDto: ReviewSupplierDto,
  ): Promise<SupplierProfileDocument> {
    const updateData: any = {
      approvalStatus: reviewDto.approvalStatus,
    };
    if (reviewDto.approvalStatus === 'approved') {
      updateData.approvedAt = new Date();
      updateData.rejectionReason = null;
    } else if (reviewDto.approvalStatus === 'rejected') {
      updateData.rejectionReason =
        reviewDto.rejectionReason || 'Application rejected by administrator';
    }

    if (reviewDto.verifiedBadge !== undefined) {
      updateData.verifiedBadge = reviewDto.verifiedBadge;
    }

    const profile = await this.supplierProfileModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('user', 'fullName email phone avatarUrl status')
      .exec();

    if (!profile) {
      throw new NotFoundException('Supplier profile not found');
    }
    return profile;
  }

  async findAll(query: {
    status?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const filter: any = {};
    if (query.status) filter.approvalStatus = query.status;
    if (query.verified !== undefined) filter.verifiedBadge = query.verified;
    if (query.search) {
      filter.businessName = { $regex: query.search, $options: 'i' };
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      this.supplierProfileModel
        .find(filter)
        .populate('user', 'fullName email phone avatarUrl')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.supplierProfileModel.countDocuments(filter).exec(),
    ]);

    return {
      suppliers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublicDirectory(query: {
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = { approvalStatus: 'approved' };
    if (query.state)
      filter['address.state'] = { $regex: query.state, $options: 'i' };
    if (query.search)
      filter.businessName = { $regex: query.search, $options: 'i' };

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      this.supplierProfileModel
        .find(filter)
        .populate('user', 'fullName avatarUrl')
        .skip(skip)
        .limit(limit)
        .sort({ verifiedBadge: -1, createdAt: -1 })
        .exec(),
      this.supplierProfileModel.countDocuments(filter).exec(),
    ]);

    return {
      suppliers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
