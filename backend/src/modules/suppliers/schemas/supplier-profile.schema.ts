import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type SupplierProfileDocument = SupplierProfile & Document;

@Schema({ _id: false })
export class Address {
  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ default: 'Nigeria', trim: true })
  country: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class SupplierProfile {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  businessName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ type: AddressSchema, required: true })
  address: Address;

  @Prop({ trim: true })
  cacNumber?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ default: false, index: true })
  verifiedBadge: boolean;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  })
  approvalStatus: 'pending' | 'approved' | 'rejected';

  @Prop()
  rejectionReason?: string;

  @Prop()
  approvedAt?: Date;
}

export const SupplierProfileSchema =
  SchemaFactory.createForClass(SupplierProfile);

SupplierProfileSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
