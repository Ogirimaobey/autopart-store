import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Product } from '../../products/schemas/product.schema';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  supplier: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ default: Date.now })
  addedAt: Date;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  buyer: MongooseSchema.Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
