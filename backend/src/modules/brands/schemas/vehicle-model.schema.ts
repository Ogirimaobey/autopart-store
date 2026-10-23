import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { VehicleBrand } from './vehicle-brand.schema';

export type VehicleModelDocument = VehicleModel & Document;

@Schema({ timestamps: true })
export class VehicleModel {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: VehicleBrand.name,
    required: true,
    index: true,
  })
  vehicleBrand: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g. Corolla, Camry, Civic, CR-V, Hilux

  @Prop({ required: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ required: true })
  yearStart: number;

  @Prop({ type: Number, default: null })
  yearEnd?: number;

  @Prop({ type: [String], default: [] })
  popularEngineCodes: string[]; // e.g., ["2GR-FE", "1NZ-FE", "K24Z"]

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const VehicleModelSchema = SchemaFactory.createForClass(VehicleModel);

// Compound index so a model name is unique per brand
VehicleModelSchema.index({ vehicleBrand: 1, slug: 1 }, { unique: true });

VehicleModelSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
