import Order from '../models/order.model';
import SubOrder from '../models/subOrder.model';
import Wallet from '../models/wallet.model';
import Transaction from '../models/transaction.model';
import crypto from 'crypto';
import axios from 'axios';
import User from '../models/user.model';

class PaymentService {
  // Real Paystack Initialization
  public async initializePayment(orderId: string, buyerId: string): Promise<any> {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.buyerId.toString() !== buyerId) throw new Error('Not authorized');
    if (order.status !== 'PENDING') throw new Error('Order is not in PENDING state');

    const buyer = await User.findById(buyerId);
    if (!buyer) throw new Error('Buyer not found');

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) throw new Error('Paystack Secret Key not configured');

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: buyer.email,
          amount: Math.round(order.totalAmount * 100), // Paystack expects amount in Kobo/lowest denomination
          reference: `ORDER-${order._id}-${Date.now()}`,
          metadata: {
            orderId: order._id,
            buyerId: buyer._id,
          }
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data; // { authorization_url, access_code, reference }
    } catch (error: any) {
      console.error('Paystack Error:', error.response?.data || error.message);
      throw new Error('Failed to initialize payment with Paystack');
    }
  }

  // Real Webhook logic with Signature Verification
  public async handleWebhook(reqBody: any, signature: string): Promise<void> {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) throw new Error('Paystack Secret Key not configured');

    const hash = crypto.createHmac('sha512', paystackSecretKey).update(JSON.stringify(reqBody)).digest('hex');
    if (hash !== signature) {
      throw new Error('Invalid signature');
    }

    const event = reqBody;

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      const orderId = metadata?.orderId;

      if (!orderId) throw new Error('Webhook missing orderId in metadata');

      const order = await Order.findById(orderId);
      if (!order) throw new Error('Order not found');

      if (order.status === 'PENDING') {
        order.status = 'PAID';
        order.paymentRef = reference;
        await order.save();

        // Update SubOrders to PAID
        await SubOrder.updateMany(
          { orderId: order._id } as any,
          { $set: { status: 'PAID' } }
        );
      }
    }
  }

  // Escrow Logic - When buyer confirms delivery or vendor marks shipped -> delivered
  public async confirmDelivery(subOrderId: string, buyerId: string): Promise<void> {
    const subOrder = await SubOrder.findById(subOrderId).populate('orderId');
    if (!subOrder) throw new Error('SubOrder not found');
    
    const parentOrder: any = subOrder.orderId;
    if (parentOrder.buyerId.toString() !== buyerId) throw new Error('Not authorized');

    if (subOrder.status !== 'SHIPPED') {
      throw new Error('Can only confirm delivery for SHIPPED orders');
    }

    subOrder.status = 'DELIVERED';
    await subOrder.save();

    // Release Funds from Escrow to Vendor Wallet
    await this.releaseEscrow(subOrder.vendorId.toString(), subOrder.subTotal, subOrder._id.toString());
  }

  private async releaseEscrow(vendorId: string, amount: number, subOrderId: string): Promise<void> {
    // 5% Platform Commission
    const commission = amount * 0.05;
    const vendorPayout = amount - commission;

    let wallet = await Wallet.findOne({ userId: vendorId } as any);
    if (!wallet) {
      wallet = await Wallet.create({ userId: vendorId, balance: 0 } as any);
    }

    // Add to wallet
    wallet.balance += vendorPayout;
    await wallet.save();

    // Log Transaction
    await Transaction.create({
      walletId: wallet._id,
      amount: vendorPayout,
      type: 'PAYOUT',
      status: 'COMPLETED',
      reference: `PAYOUT-${crypto.randomBytes(8).toString('hex')}`,
    } as any);

    // Log Commission
    await Transaction.create({
      walletId: wallet._id,
      amount: commission,
      type: 'COMMISSION',
      status: 'COMPLETED',
      reference: `COMM-${crypto.randomBytes(8).toString('hex')}`,
    } as any);
  }
}

export default new PaymentService();
