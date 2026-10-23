import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from './schemas/product.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import {
  PartBrand,
  PartBrandDocument,
} from '../brands/schemas/part-brand.schema';
import {
  VehicleBrand,
  VehicleBrandDocument,
} from '../brands/schemas/vehicle-brand.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto, ProductSortBy } from './dto/filter-products.dto';
import slugify from 'slugify';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(PartBrand.name)
    private partBrandModel: Model<PartBrandDocument>,
    @InjectModel(VehicleBrand.name)
    private vehicleBrandModel: Model<VehicleBrandDocument>,
  ) {}

  async create(
    supplierId: string,
    dto: CreateProductDto,
  ): Promise<ProductDocument> {
    const categoryId = await this.resolveCategoryId(dto.category);
    const partBrandId = await this.resolvePartBrandId(dto.partBrand);

    // Generate unique slug
    const baseSlug = slugify(dto.title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    const existing = await this.productModel.findOne({ slug: uniqueSlug });
    if (existing) {
      uniqueSlug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    // Process compatible vehicles
    const compatibleVehicles = (dto.compatibleVehicles || []).map((v) => ({
      ...v,
      engineNumbers: (v.engineNumbers || []).map((e) => e.trim().toUpperCase()),
      engineTypes: (v.engineTypes || []).map((t) => t.trim()),
    }));

    const product = new this.productModel({
      ...dto,
      slug: uniqueSlug,
      category: categoryId,
      partBrand: partBrandId,
      compatibleVehicles,
      supplier: supplierId,
      status: dto.status || ProductStatus.ACTIVE,
      viewsCount: 0,
      salesCount: 0,
    });

    const saved = await product.save();
    return this.findById(saved._id.toString());
  }

  async findAll(query: FilterProductsDto) {
    const filter: FilterQuery<ProductDocument> = {};

    // Status filter (defaults to active unless specified)
    filter.status = query.status || ProductStatus.ACTIVE;

    // Keyword / Text search
    if (query.q && query.q.trim()) {
      filter.$text = { $search: query.q.trim() };
    }

    // Category filter
    if (query.category) {
      filter.category = await this.resolveCategoryId(query.category);
    }

    // Part Brand filter
    if (query.partBrand) {
      filter.partBrand = await this.resolvePartBrandId(query.partBrand);
    }

    // Condition filter
    if (query.condition) {
      filter.condition = query.condition;
    }

    // Supplier filter
    if (query.supplier) {
      filter.supplier = query.supplier;
    }

    // Price range filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    // Vehicle compatibility subdocument filters
    const vehicleConditions: any[] = [];

    if (query.vehicleBrand) {
      vehicleConditions.push({
        'compatibleVehicles.vehicleBrandName': {
          $regex: new RegExp(`^${query.vehicleBrand.trim()}$`, 'i'),
        },
      });
    }

    if (query.vehicleModel) {
      vehicleConditions.push({
        'compatibleVehicles.vehicleModel': {
          $regex: new RegExp(query.vehicleModel.trim(), 'i'),
        },
      });
    }

    if (query.year) {
      vehicleConditions.push({
        'compatibleVehicles.yearStart': { $lte: query.year },
        $or: [
          { 'compatibleVehicles.yearEnd': { $gte: query.year } },
          { 'compatibleVehicles.yearEnd': null },
        ],
      });
    }

    // Engine Number / Code partial match (crucial for auto parts: e.g. "2GR" matches "2GR-FE")
    if (query.engineNumber && query.engineNumber.trim()) {
      vehicleConditions.push({
        'compatibleVehicles.engineNumbers': {
          $regex: new RegExp(query.engineNumber.trim(), 'i'),
        },
      });
    }

    if (query.engineType && query.engineType.trim()) {
      vehicleConditions.push({
        'compatibleVehicles.engineTypes': {
          $regex: new RegExp(query.engineType.trim(), 'i'),
        },
      });
    }

    if (vehicleConditions.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push(...vehicleConditions);
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    switch (query.sort) {
      case ProductSortBy.PRICE_ASC:
        sortOptions = { price: 1 };
        break;
      case ProductSortBy.PRICE_DESC:
        sortOptions = { price: -1 };
        break;
      case ProductSortBy.POPULAR:
        sortOptions = { viewsCount: -1, salesCount: -1 };
        break;
      case ProductSortBy.NEWEST:
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Pagination
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .populate('partBrand', 'name slug logoUrl isOem')
        .populate('supplier', 'fullName email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  async findByIdOrSlug(identifier: string): Promise<ProductDocument> {
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isId
      ? { _id: identifier }
      : { slug: identifier.toLowerCase() };

    const product = await this.productModel
      .findOneAndUpdate(query, { $inc: { viewsCount: 1 } }, { new: true })
      .populate('category', 'name slug description')
      .populate('partBrand', 'name slug logoUrl isOem countryOfOrigin')
      .populate('supplier', 'fullName email phone')
      .populate('compatibleVehicles.vehicleBrand', 'name slug logoUrl')
      .exec();

    if (!product) {
      throw new NotFoundException('Product listing not found');
    }
    return product;
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name slug')
      .populate('partBrand', 'name slug logoUrl isOem')
      .populate('supplier', 'fullName email phone')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findRelated(productId: string, limit = 4): Promise<ProductDocument[]> {
    const product = await this.productModel.findById(productId);
    if (!product) return [];

    const related = await this.productModel
      .find({
        _id: { $ne: product._id },
        category: product.category,
        status: ProductStatus.ACTIVE,
      })
      .populate('category', 'name slug')
      .populate('partBrand', 'name slug logoUrl isOem')
      .populate('supplier', 'fullName')
      .limit(limit)
      .sort({ viewsCount: -1 })
      .exec();

    return related;
  }

  async findSupplierListings(
    supplierId: string,
    query: { status?: string; page?: number; limit?: number },
  ) {
    const filter: any = { supplier: supplierId };
    if (query.status) {
      filter.status = query.status;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('category', 'name slug')
        .populate('partBrand', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    productId: string,
    supplierId: string,
    dto: UpdateProductDto,
    isAdmin = false,
  ): Promise<ProductDocument> {
    const product = await this.findById(productId);
    const ownerId = (product.supplier as any)?._id
      ? (product.supplier as any)._id.toString()
      : product.supplier.toString();

    if (!isAdmin && ownerId !== supplierId) {
      throw new ForbiddenException(
        'You are not authorized to update this listing',
      );
    }

    const updateData: any = { ...dto };

    if (
      dto.title &&
      !product.slug.startsWith(
        slugify(dto.title, { lower: true, strict: true }),
      )
    ) {
      updateData.slug = `${slugify(dto.title, { lower: true, strict: true })}-${crypto.randomBytes(2).toString('hex')}`;
    }

    if (dto.category) {
      updateData.category = await this.resolveCategoryId(dto.category);
    }
    if (dto.partBrand) {
      updateData.partBrand = await this.resolvePartBrandId(dto.partBrand);
    }

    const updated = await this.productModel
      .findByIdAndUpdate(productId, { $set: updateData }, { new: true })
      .populate('category', 'name slug')
      .populate('partBrand', 'name slug logoUrl isOem')
      .populate('supplier', 'fullName email phone')
      .exec();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    return updated;
  }

  async delete(
    productId: string,
    supplierId: string,
    isAdmin = false,
  ): Promise<{ deleted: boolean }> {
    const product = await this.findById(productId);
    const ownerId = (product.supplier as any)?._id
      ? (product.supplier as any)._id.toString()
      : product.supplier.toString();

    if (!isAdmin && ownerId !== supplierId) {
      throw new ForbiddenException(
        'You are not authorized to delete this listing',
      );
    }

    await this.productModel.findByIdAndDelete(productId).exec();
    return { deleted: true };
  }

  async moderate(
    productId: string,
    status: ProductStatus,
  ): Promise<ProductDocument> {
    const updated = await this.productModel
      .findByIdAndUpdate(productId, { $set: { status } }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    return updated;
  }

  // --- Helpers to resolve slug or ObjectId ---

  private async resolveCategoryId(idOrSlug: string): Promise<string> {
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
      return idOrSlug;
    }
    const cat = await this.categoryModel.findOne({
      slug: idOrSlug.toLowerCase(),
    });
    if (!cat) throw new BadRequestException(`Category '${idOrSlug}' not found`);
    return cat._id.toString();
  }

  private async resolvePartBrandId(idOrSlug: string): Promise<string> {
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
      return idOrSlug;
    }
    const brand = await this.partBrandModel.findOne({
      slug: idOrSlug.toLowerCase(),
    });
    if (!brand)
      throw new BadRequestException(`Part brand '${idOrSlug}' not found`);
    return brand._id.toString();
  }
}
