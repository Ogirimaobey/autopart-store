import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Product } from '../../products/schemas/product.schema';

export type EnquiryDocument = Enquiry & Document;

export enum EnquiryStatus {
  OPEN = 'open',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class EnquiryMessage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  sender: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export const EnquiryMessageSchema =
  SchemaFactory.createForClass(EnquiryMessage);

@Schema({ timestamps: true })
export class Enquiry {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  buyer: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  supplier: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  subject: string;

  @Prop({
    type: String,
    enum: Object.values(EnquiryStatus),
    default: EnquiryStatus.OPEN,
    index: true,
  })
  status: EnquiryStatus;

  @Prop({ type: [EnquiryMessageSchema], default: [] })
  messages: EnquiryMessage[];

  @Prop()
  lastMessageAt: Date;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);

EnquirySchema.index({ supplier: 1, status: 1, updatedAt: -1 });
EnquirySchema.index({ buyer: 1, updatedAt: -1 });

EnquirySchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
