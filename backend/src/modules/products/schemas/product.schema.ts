import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Category } from '../../categories/schemas/category.schema';
import { PartBrand } from '../../brands/schemas/part-brand.schema';
import { VehicleBrand } from '../../brands/schemas/vehicle-brand.schema';

export type ProductDocument = Product & Document;

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
}

export enum ProductStatus {
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out-of-stock',
  ARCHIVED = 'archived',
}

@Schema({ _id: false })
export class CompatibleVehicle {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: VehicleBrand.name,
    required: false,
    index: true,
  })
  vehicleBrand?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  vehicleBrandName: string; // e.g. "Toyota"

  @Prop({ required: true, trim: true })
  vehicleModel: string; // e.g. "Camry"

  @Prop({ required: true })
  yearStart: number; // e.g. 2006

  @Prop({ type: Number, default: null })
  yearEnd?: number; // e.g. 2011

  @Prop({ type: [String], default: [] })
  engineTypes: string[]; // e.g. ["2.4L 4-Cylinder", "3.5L V6"]

  @Prop({ type: [String], default: [] })
  engineNumbers: string[]; // e.g. ["2AZ-FE", "2GR-FE"]
}
export const CompatibleVehicleSchema =
  SchemaFactory.createForClass(CompatibleVehicle);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  slug: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, min: 0, index: true })
  price: number; // In Naira (₦)

  @Prop({ min: 0, default: null })
  discountPrice?: number;

  @Prop({ required: true, min: 0, default: 0 })
  stockQuantity: number;

  @Prop({
    type: String,
    enum: Object.values(ProductCondition),
    default: ProductCondition.USED,
    index: true,
  })
  condition: ProductCondition;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Category.name,
    required: true,
    index: true,
  })
  category: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: PartBrand.name,
    required: true,
    index: true,
  })
  partBrand: MongooseSchema.Types.ObjectId;

  @Prop({ type: [CompatibleVehicleSchema], default: [] })
  compatibleVehicles: CompatibleVehicle[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  supplier: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.ACTIVE,
    index: true,
  })
  status: ProductStatus;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ default: 0 })
  salesCount: number;

  @Prop()
  partNumber?: string; // e.g., OEM Part number "04465-33450"
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Text Index for keyword search across title and description
ProductSchema.index(
  { title: 'text', description: 'text', partNumber: 'text' },
  { weights: { title: 10, partNumber: 8, description: 3 } },
);

// Compound indexes for performant faceted filtering
ProductSchema.index({ status: 1, price: 1, createdAt: -1 });
ProductSchema.index({ status: 1, category: 1, price: 1 });
ProductSchema.index({ status: 1, partBrand: 1, price: 1 });
ProductSchema.index({ 'compatibleVehicles.engineNumbers': 1 });
ProductSchema.index({ 'compatibleVehicles.vehicleBrandName': 1 });

ProductSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
