import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  walletId: mongoose.Schema.Types.ObjectId;
  orderId?: mongoose.Schema.Types.ObjectId;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW_HOLD' | 'PAYOUT' | 'COMMISSION';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference: string;
}

const TransactionSchema: Schema = new Schema(
  {
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true },
    type: { 
      type: String, 
      enum: ['DEPOSIT', 'WITHDRAWAL', 'ESCROW_HOLD', 'PAYOUT', 'COMMISSION'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['PENDING', 'COMPLETED', 'FAILED'], 
      default: 'COMPLETED' 
    },
    reference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
