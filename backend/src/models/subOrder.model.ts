import mongoose, { Schema, Document } from 'mongoose';
import { IOrderItem } from './order.model';

export interface ISubOrder extends Document {
  orderId: mongoose.Schema.Types.ObjectId;
  vendorId: mongoose.Schema.Types.ObjectId;
  items: IOrderItem[];
  subTotal: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

const OrderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const SubOrderSchema: Schema = new Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    subTotal: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], 
      default: 'PENDING' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubOrder>('SubOrder', SubOrderSchema);
