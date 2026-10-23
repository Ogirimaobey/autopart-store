import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VehicleBrand,
  VehicleBrandDocument,
} from './schemas/vehicle-brand.schema';
import {
  VehicleModel,
  VehicleModelDocument,
} from './schemas/vehicle-model.schema';
import { PartBrand, PartBrandDocument } from './schemas/part-brand.schema';
import {
  CreateVehicleBrandDto,
  UpdateVehicleBrandDto,
} from './dto/create-vehicle-brand.dto';
import {
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
} from './dto/create-vehicle-model.dto';
import {
  CreatePartBrandDto,
  UpdatePartBrandDto,
} from './dto/create-part-brand.dto';
import slugify from 'slugify';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(VehicleBrand.name)
    private vehicleBrandModel: Model<VehicleBrandDocument>,
    @InjectModel(VehicleModel.name)
    private vehicleModelModel: Model<VehicleModelDocument>,
    @InjectModel(PartBrand.name)
    private partBrandModel: Model<PartBrandDocument>,
  ) {}

  // ---------------- Vehicle Brand Methods ----------------

  async createVehicleBrand(
    dto: CreateVehicleBrandDto,
  ): Promise<VehicleBrandDocument> {
    const slug =
      dto.slug?.toLowerCase() ||
      slugify(dto.name, { lower: true, strict: true });
    const existing = await this.vehicleBrandModel.findOne({
      $or: [{ name: dto.name }, { slug }],
    });
    if (existing) {
      throw new ConflictException('Vehicle brand already exists');
    }

    const brand = new this.vehicleBrandModel({ ...dto, slug });
    return brand.save();
  }

  async findAllVehicleBrands(
    activeOnly = true,
  ): Promise<VehicleBrandDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.vehicleBrandModel
      .find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async findVehicleBrandBySlugOrId(
    identifier: string,
  ): Promise<VehicleBrandDocument> {
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const brand = isId
      ? await this.vehicleBrandModel.findById(identifier).exec()
      : await this.vehicleBrandModel
          .findOne({ slug: identifier.toLowerCase() })
          .exec();

    if (!brand) {
      throw new NotFoundException('Vehicle brand not found');
    }
    return brand;
  }

  async updateVehicleBrand(
    id: string,
    dto: UpdateVehicleBrandDto,
  ): Promise<VehicleBrandDocument> {
    const updateData: any = { ...dto };
    if (dto.name && !dto.slug) {
      updateData.slug = slugify(dto.name, { lower: true, strict: true });
    }

    const brand = await this.vehicleBrandModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!brand) {
      throw new NotFoundException('Vehicle brand not found');
    }
    return brand;
  }

  async deleteVehicleBrand(id: string): Promise<{ deleted: boolean }> {
    const brand = await this.vehicleBrandModel.findByIdAndDelete(id).exec();
    if (!brand) {
      throw new NotFoundException('Vehicle brand not found');
    }
    // Delete associated models
    await this.vehicleModelModel.deleteMany({ vehicleBrand: id }).exec();
    return { deleted: true };
  }

  // ---------------- Vehicle Model Methods ----------------

  async createVehicleModel(
    dto: CreateVehicleModelDto,
  ): Promise<VehicleModelDocument> {
    const slug =
      dto.slug?.toLowerCase() ||
      slugify(dto.name, { lower: true, strict: true });
    const existing = await this.vehicleModelModel.findOne({
      vehicleBrand: dto.vehicleBrand,
      slug,
    });
    if (existing) {
      throw new ConflictException(
        'Model with this name already exists for this brand',
      );
    }

    const model = new this.vehicleModelModel({ ...dto, slug });
    return model.save();
  }

  async findModelsByBrand(
    brandIdOrSlug: string,
    activeOnly = true,
  ): Promise<VehicleModelDocument[]> {
    let brandId = brandIdOrSlug;
    if (!/^[0-9a-fA-F]{24}$/.test(brandIdOrSlug)) {
      const brand = await this.vehicleBrandModel.findOne({
        slug: brandIdOrSlug.toLowerCase(),
      });
      if (!brand) throw new NotFoundException('Vehicle brand not found');
      brandId = brand._id.toString();
    }

    const filter: any = { vehicleBrand: brandId };
    if (activeOnly) filter.isActive = true;

    return this.vehicleModelModel.find(filter).sort({ name: 1 }).exec();
  }

  async updateVehicleModel(
    id: string,
    dto: UpdateVehicleModelDto,
  ): Promise<VehicleModelDocument> {
    const updateData: any = { ...dto };
    if (dto.name && !dto.slug) {
      updateData.slug = slugify(dto.name, { lower: true, strict: true });
    }

    const model = await this.vehicleModelModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!model) {
      throw new NotFoundException('Vehicle model not found');
    }
    return model;
  }

  async deleteVehicleModel(id: string): Promise<{ deleted: boolean }> {
    const model = await this.vehicleModelModel.findByIdAndDelete(id).exec();
    if (!model) {
      throw new NotFoundException('Vehicle model not found');
    }
    return { deleted: true };
  }

  // ---------------- Part Brand Methods ----------------

  async createPartBrand(dto: CreatePartBrandDto): Promise<PartBrandDocument> {
    const slug =
      dto.slug?.toLowerCase() ||
      slugify(dto.name, { lower: true, strict: true });
    const existing = await this.partBrandModel.findOne({
      $or: [{ name: dto.name }, { slug }],
    });
    if (existing) {
      throw new ConflictException('Part brand already exists');
    }

    const partBrand = new this.partBrandModel({ ...dto, slug });
    return partBrand.save();
  }

  async findAllPartBrands(
    activeOnly = true,
    isOem?: boolean,
  ): Promise<PartBrandDocument[]> {
    const filter: any = {};
    if (activeOnly) filter.isActive = true;
    if (isOem !== undefined) filter.isOem = isOem;

    return this.partBrandModel.find(filter).sort({ name: 1 }).exec();
  }

  async findPartBrandBySlugOrId(
    identifier: string,
  ): Promise<PartBrandDocument> {
    const isId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const brand = isId
      ? await this.partBrandModel.findById(identifier).exec()
      : await this.partBrandModel
          .findOne({ slug: identifier.toLowerCase() })
          .exec();

    if (!brand) {
      throw new NotFoundException('Part brand not found');
    }
    return brand;
  }

  async updatePartBrand(
    id: string,
    dto: UpdatePartBrandDto,
  ): Promise<PartBrandDocument> {
    const updateData: any = { ...dto };
    if (dto.name && !dto.slug) {
      updateData.slug = slugify(dto.name, { lower: true, strict: true });
    }

    const brand = await this.partBrandModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!brand) {
      throw new NotFoundException('Part brand not found');
    }
    return brand;
  }

  async deletePartBrand(id: string): Promise<{ deleted: boolean }> {
    const brand = await this.partBrandModel.findByIdAndDelete(id).exec();
    if (!brand) {
      throw new NotFoundException('Part brand not found');
    }
    return { deleted: true };
  }
}
