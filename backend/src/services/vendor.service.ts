import Product from '../models/product.model';
import SubOrder from '../models/subOrder.model';
import Wallet from '../models/wallet.model';

class VendorService {
  public async getMyProducts(vendorId: string): Promise<any> {
    return await Product.find({ vendorId } as any).populate('categoryId brandId', 'name');
  }

  public async getMySubOrders(vendorId: string): Promise<any> {
    return await SubOrder.find({ vendorId } as any)
      .populate('orderId', 'shippingAddress paymentRef createdAt')
      .sort({ createdAt: -1 });
  }

  public async updateSubOrderStatus(vendorId: string, subOrderId: string, status: string): Promise<string> {
    const subOrder = await SubOrder.findById(subOrderId);
    if (!subOrder) throw new Error('SubOrder not found');
    if (subOrder.vendorId.toString() !== vendorId) throw new Error('Not authorized for this sub-order');

    const allowedStatuses = ['PROCESSING', 'SHIPPED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Vendors can only update status to: ${allowedStatuses.join(', ')}`);
    }

    subOrder.status = status as any;
    await subOrder.save();
    return `Order status updated to ${status}`;
  }

  public async getMyWallet(vendorId: string): Promise<any> {
    const wallet = await Wallet.findOne({ userId: vendorId } as any);
    return wallet || { balance: 0 };
  }
}

export default new VendorService();
