import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PaymentDocument = Payment & Document;

export enum PaymentRecordStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true, index: true })
  reference: string;

  @Prop({ required: true, index: true })
  checkoutSessionId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  buyer: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number; // In Naira (₦)

  @Prop({ required: true, min: 0 })
  amountKobo: number; // In Kobo (₦1 = 100 kobo)

  @Prop({ default: 'NGN' })
  currency: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentRecordStatus),
    default: PaymentRecordStatus.PENDING,
    index: true,
  })
  status: PaymentRecordStatus;

  @Prop()
  channel?: string; // card, bank, ussd, qr, etc.

  @Prop({ type: Object })
  gatewayResponse?: any;

  @Prop()
  paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
