import mongoose from 'mongoose';
import Order, { IOrder } from '../models/order.model';
import SubOrder, { ISubOrder } from '../models/subOrder.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import { ICheckoutData } from '../interfaces/order.interface';

class OrderService {
  public async createOrder(buyerId: string, data: ICheckoutData): Promise<IOrder> {
    const { items, shippingAddress } = data;
    if (!items || items.length === 0) throw new Error('No order items');

    const buyer = await User.findById(buyerId);
    if (!buyer) throw new Error('Buyer not found');
    if (!buyer.address || !buyer.address.street || !buyer.address.city || !buyer.address.state || !buyer.address.country) {
      throw new Error('Please update your profile with a full delivery address before checking out');
    }

    let totalAmount = 0;
    const vendorMap: { [vendorId: string]: any[] } = {};

    // Validate products and group by vendor
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const vendorId = product.vendorId.toString();
      const orderItem = {
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };

      if (!vendorMap[vendorId]) vendorMap[vendorId] = [];
      vendorMap[vendorId].push(orderItem);
      
      totalAmount += product.price * item.quantity;
    }

    // Create Main Order
    const order = await Order.create({
      buyerId,
      totalAmount,
      shippingAddress,
      status: 'PENDING',
    } as any);

    // Create SubOrders for each vendor
    for (const vendorId in vendorMap) {
      const vendorItems = vendorMap[vendorId];
      const subTotal = vendorItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

      await SubOrder.create({
        orderId: order._id,
        vendorId: vendorId,
        items: vendorItems,
        subTotal,
        status: 'PENDING',
      } as any);

      // Deduct stock
      for (const item of vendorItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    return order;
  }

  public async getBuyerOrders(buyerId: string): Promise<IOrder[]> {
    return await Order.find({ buyerId } as any).sort({ createdAt: -1 });
  }

  public async getOrderById(orderId: string, buyerId: string): Promise<any> {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.buyerId.toString() !== buyerId) throw new Error('Not authorized');

    const subOrders = await SubOrder.find({ orderId: order._id } as any).populate('vendorId', 'fullName storeName');
    
    return {
      order,
      subOrders,
    };
  }
}

export default new OrderService();
