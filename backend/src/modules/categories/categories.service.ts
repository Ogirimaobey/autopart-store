import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createDto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug =
      createDto.slug?.toLowerCase() ||
      slugify(createDto.name, { lower: true, strict: true });

    const existing = await this.categoryModel.findOne({
      $or: [{ name: createDto.name }, { slug }],
    });

    if (existing) {
      throw new ConflictException(
        'Category with this name or slug already exists',
      );
    }

    const category = new this.categoryModel({
      ...createDto,
      slug,
    });

    return category.save();
  }

  async findAll(activeOnly = true): Promise<CategoryDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.categoryModel
      .find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryModel
      .findOne({ slug: slug.toLowerCase() })
      .populate('parentCategory', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findById(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel
      .findById(id)
      .populate('parentCategory', 'name slug')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: string,
    updateDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const updateData: any = { ...updateDto };
    if (updateDto.name && !updateDto.slug) {
      updateData.slug = slugify(updateDto.name, { lower: true, strict: true });
    }

    const updated = await this.categoryModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('parentCategory', 'name slug')
      .exec();

    if (!updated) {
      throw new NotFoundException('Category not found');
    }
    return updated;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return { deleted: true };
  }
}
