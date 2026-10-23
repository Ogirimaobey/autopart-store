import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleBrandDocument = VehicleBrand & Document;

@Schema({ timestamps: true })
export class VehicleBrand {
  @Prop({ required: true, trim: true, unique: true })
  name: string; // e.g. Toyota, Honda, Mercedes-Benz, Ford, Nissan

  @Prop({
    required: true,
    trim: true,
    unique: true,
    index: true,
    lowercase: true,
  })
  slug: string;

  @Prop()
  logoUrl?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const VehicleBrandSchema = SchemaFactory.createForClass(VehicleBrand);

VehicleBrandSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
