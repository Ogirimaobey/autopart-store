import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PartBrandDocument = PartBrand & Document;

@Schema({ timestamps: true })
export class PartBrand {
  @Prop({ required: true, trim: true, unique: true })
  name: string; // e.g. Bosch, Denso, NGK, Brembo, Delphi, OEM

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

  @Prop({ default: false, index: true })
  isOem: boolean;

  @Prop({ trim: true })
  countryOfOrigin?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const PartBrandSchema = SchemaFactory.createForClass(PartBrand);

PartBrandSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
