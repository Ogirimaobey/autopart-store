import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Product } from '../../products/schemas/product.schema';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  READY_FOR_PICKUP = 'ready_for_pickup',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum DeliveryType {
  SHIPPING = 'shipping',
  PICKUP = 'pickup',
}

@Schema({ _id: false })
export class OrderLineItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  partNumber?: string;

  @Prop()
  image?: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;
}
export const OrderLineItemSchema = SchemaFactory.createForClass(OrderLineItem);

@Schema({ _id: false })
export class OrderShippingAddress {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  state: string;

  @Prop({ default: 'Nigeria', trim: true })
  country: string;

  @Prop({ trim: true })
  notes?: string;
}
export const OrderShippingAddressSchema =
  SchemaFactory.createForClass(OrderShippingAddress);

@Schema({ _id: false })
export class OrderStatusHistory {
  @Prop({ required: true, enum: Object.values(OrderStatus) })
  status: OrderStatus;

  @Prop({ default: Date.now })
  changedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  changedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true })
  note?: string;
}
export const OrderStatusHistorySchema =
  SchemaFactory.createForClass(OrderStatusHistory);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderNumber: string; // e.g. "ORD-2026-X8F2"

  @Prop({ required: true, index: true })
  checkoutSessionId: string; // groups multi-supplier orders under a single checkout session

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

  @Prop({ type: [OrderLineItemSchema], required: true })
  items: OrderLineItem[];

  @Prop({ required: true, min: 0 })
  itemsSubtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  shippingFee: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: OrderShippingAddressSchema, required: true })
  shippingAddress: OrderShippingAddress;

  @Prop({
    type: String,
    enum: Object.values(DeliveryType),
    default: DeliveryType.SHIPPING,
  })
  deliveryType: DeliveryType;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING_PAYMENT,
    index: true,
  })
  status: OrderStatus;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true,
  })
  paymentStatus: PaymentStatus;

  @Prop({ index: true })
  paymentReference?: string;

  @Prop()
  paidAt?: Date;

  @Prop({ type: [OrderStatusHistorySchema], default: [] })
  statusHistory: OrderStatusHistory[];

  @Prop({ trim: true })
  supplierNotes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ supplier: 1, status: 1, createdAt: -1 });

OrderSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    return ret;
  },
});
