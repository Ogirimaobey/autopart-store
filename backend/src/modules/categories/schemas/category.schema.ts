import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    index: true,
    lowercase: true,
  })
  slug: string;

  @Prop({ trim: true })
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null })
  parentCategory?: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
