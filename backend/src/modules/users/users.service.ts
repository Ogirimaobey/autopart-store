import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      passwordHash,
    });

    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async updateRefreshToken(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshTokenHash }).exec();
  }

  async findAll(query: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(
    id: string,
    status: 'active' | 'pending' | 'suspended',
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
