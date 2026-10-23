import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
} from './schemas/order.schema';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '../products/schemas/product.schema';
import { CartService } from '../cart/cart.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/checkout.dto';
import { Role } from '../../common/enums/role.enum';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly cartService: CartService,
  ) {}

  async checkout(buyerId: string, dto: CheckoutDto) {
    const cart = await this.cartService.getCart(buyerId);

    if (
      !cart.supplierGroups ||
      cart.supplierGroups.length === 0 ||
      cart.totalItems === 0
    ) {
      throw new BadRequestException('Your cart is empty');
    }

    // Validate stock for all items
    for (const group of cart.supplierGroups) {
      for (const item of group.items) {
        if (!item.inStock) {
          throw new BadRequestException(
            `Item "${item.product.title}" does not have sufficient stock (${item.quantity} requested, ${item.product.stockQuantity} available).`,
          );
        }
      }
    }

    const checkoutSessionId = `cs_${crypto.randomBytes(8).toString('hex')}`;
    const createdOrders: OrderDocument[] = [];

    // Create an individual order per supplier group
    for (const group of cart.supplierGroups) {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

      const lineItems = group.items.map((item: any) => ({
        product: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        partNumber: item.product.partNumber,
        image: item.product.images?.[0] || '',
        unitPrice: item.product.effectivePrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const shippingFee = 0; // Flat or free promo baseline; extensible per vendor
      const totalAmount = group.supplierSubtotal + shippingFee;

      const order = new this.orderModel({
        orderNumber,
        checkoutSessionId,
        buyer: buyerId,
        supplier: group.supplier.id,
        items: lineItems,
        itemsSubtotal: group.supplierSubtotal,
        shippingFee,
        totalAmount,
        shippingAddress: dto.shippingAddress,
        deliveryType: dto.deliveryType,
        status: OrderStatus.PENDING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        statusHistory: [
          {
            status: OrderStatus.PENDING_PAYMENT,
            changedAt: new Date(),
            note: 'Order created awaiting payment confirmation',
          },
        ],
        supplierNotes: dto.notes,
      });

      const savedOrder = await order.save();
      createdOrders.push(savedOrder);
    }

    // Clear cart after creating pending orders
    await this.cartService.clearCart(buyerId);

    return {
      checkoutSessionId,
      orders: createdOrders,
      totalAmount: cart.grandTotal,
      currency: 'NGN',
    };
  }

  async findByCheckoutSessionId(sessionId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ checkoutSessionId: sessionId })
      .populate('supplier', 'fullName email phone')
      .populate('buyer', 'fullName email phone')
      .exec();
  }

  async findBuyerOrders(
    buyerId: string,
    query: { status?: string; page?: number; limit?: number },
  ) {
    const filter: any = { buyer: buyerId };
    if (query.status) filter.status = query.status;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('supplier', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findSupplierOrders(
    supplierId: string,
    query: { status?: string; page?: number; limit?: number },
  ) {
    const filter: any = { supplier: supplierId };
    if (query.status) filter.status = query.status;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('buyer', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAll(query: { status?: string; page?: number; limit?: number }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('buyer', 'fullName email phone')
        .populate('supplier', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(id)
      .populate('buyer', 'fullName email phone')
      .populate('supplier', 'fullName email phone')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const buyerId =
      (order.buyer as any)?._id?.toString() || order.buyer.toString();
    const supplierId =
      (order.supplier as any)?._id?.toString() || order.supplier.toString();

    if (
      userRole !== Role.ADMIN &&
      userId !== buyerId &&
      userId !== supplierId
    ) {
      throw new ForbiddenException('You are not authorized to view this order');
    }

    return order;
  }

  async updateStatus(
    id: string,
    userId: string,
    userRole: Role,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderDocument> {
    const order = await this.findById(id, userId, userRole);

    const supplierId =
      (order.supplier as any)?._id?.toString() || order.supplier.toString();
    if (userRole !== Role.ADMIN && userId !== supplierId) {
      throw new ForbiddenException(
        'Only the fulfilling supplier or admin can update order status',
      );
    }

    order.status = dto.status;
    if (dto.supplierNotes) {
      order.supplierNotes = dto.supplierNotes;
    }

    order.statusHistory.push({
      status: dto.status,
      changedAt: new Date(),
      changedBy: userId as any,
      note: dto.note || `Order status updated to ${dto.status}`,
    });

    return order.save();
  }

  async markOrdersAsPaid(
    checkoutSessionId: string,
    paymentReference: string,
  ): Promise<OrderDocument[]> {
    const orders = await this.orderModel.find({ checkoutSessionId });
    if (!orders || orders.length === 0) {
      throw new NotFoundException(
        `No orders found for checkout session: ${checkoutSessionId}`,
      );
    }

    const paidAt = new Date();

    for (const order of orders) {
      if (order.paymentStatus === PaymentStatus.PAID) {
        continue;
      }

      order.status = OrderStatus.PAID;
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentReference = paymentReference;
      order.paidAt = paidAt;

      order.statusHistory.push({
        status: OrderStatus.PAID,
        changedAt: paidAt,
        note: `Payment verified successfully (Ref: ${paymentReference})`,
      });

      await order.save();

      // Decrement inventory stock & increment sales count
      for (const item of order.items) {
        const product = await this.productModel.findById(item.product);
        if (product) {
          product.stockQuantity = Math.max(
            0,
            product.stockQuantity - item.quantity,
          );
          product.salesCount = (product.salesCount || 0) + item.quantity;
          if (product.stockQuantity === 0) {
            product.status = ProductStatus.OUT_OF_STOCK;
          }
          await product.save();
        }
      }
    }

    return orders;
  }
}
