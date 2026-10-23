import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import {
  Product,
  ProductDocument,
  ProductStatus,
} from '../products/schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getOrCreateCart(buyerId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ buyer: buyerId });
    if (!cart) {
      cart = await this.cartModel.create({ buyer: buyerId, items: [] });
    }
    return cart;
  }

  async getCart(buyerId: string) {
    const cart = await this.getOrCreateCart(buyerId);

    const populatedCart = await this.cartModel
      .findById(cart._id)
      .populate({
        path: 'items.product',
        select:
          'title slug images price discountPrice stockQuantity status partNumber condition',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'partBrand', select: 'name slug logoUrl isOem' },
        ],
      })
      .populate({
        path: 'items.supplier',
        select: 'fullName email phone',
      })
      .exec();

    // Group items by supplier for multi-supplier checkout fulfillment
    const supplierGroupsMap = new Map<string, any>();
    let totalItems = 0;
    let grandTotal = 0;

    for (const item of populatedCart?.items || []) {
      const product: any = item.product;
      const supplier: any = item.supplier;

      if (!product) continue;

      const effectivePrice = product.discountPrice ?? product.price;
      const itemSubtotal = effectivePrice * item.quantity;
      totalItems += item.quantity;
      grandTotal += itemSubtotal;

      const supplierId = supplier?._id?.toString() || item.supplier.toString();

      if (!supplierGroupsMap.has(supplierId)) {
        supplierGroupsMap.set(supplierId, {
          supplier: {
            id: supplierId,
            fullName: supplier?.fullName || 'Auto Parts Supplier',
            email: supplier?.email,
            phone: supplier?.phone,
          },
          items: [],
          supplierSubtotal: 0,
          itemCount: 0,
        });
      }

      const group = supplierGroupsMap.get(supplierId);
      group.items.push({
        product: {
          id: product._id,
          title: product.title,
          slug: product.slug,
          images: product.images,
          price: product.price,
          discountPrice: product.discountPrice,
          effectivePrice,
          stockQuantity: product.stockQuantity,
          status: product.status,
          condition: product.condition,
          partNumber: product.partNumber,
          category: product.category,
          partBrand: product.partBrand,
        },
        quantity: item.quantity,
        subtotal: itemSubtotal,
        inStock:
          product.status === ProductStatus.ACTIVE &&
          product.stockQuantity >= item.quantity,
        addedAt: item.addedAt,
      });
      group.supplierSubtotal += itemSubtotal;
      group.itemCount += item.quantity;
    }

    return {
      cartId: populatedCart?._id,
      buyerId,
      totalItems,
      grandTotal,
      supplierGroups: Array.from(supplierGroupsMap.values()),
    };
  }

  async addItem(buyerId: string, dto: AddToCartDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== ProductStatus.ACTIVE || product.stockQuantity <= 0) {
      throw new BadRequestException(
        'This product is currently unavailable or out of stock',
      );
    }

    const supplierId = (product.supplier as any)?._id || product.supplier;
    const cart = await this.getOrCreateCart(buyerId);

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === dto.productId,
    );

    const targetQuantity =
      existingItemIndex > -1
        ? cart.items[existingItemIndex].quantity + dto.quantity
        : dto.quantity;

    if (targetQuantity > product.stockQuantity) {
      throw new BadRequestException(
        `Cannot add ${targetQuantity} items. Only ${product.stockQuantity} in stock.`,
      );
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = targetQuantity;
    } else {
      cart.items.push({
        product: product._id as any,
        supplier: supplierId,
        quantity: dto.quantity,
        addedAt: new Date(),
      });
    }

    await cart.save();
    return this.getCart(buyerId);
  }

  async updateItem(buyerId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(buyerId);
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === dto.productId,
    );

    if (existingIndex === -1) {
      throw new NotFoundException('Item not found in your cart');
    }

    if (dto.quantity <= 0) {
      cart.items.splice(existingIndex, 1);
    } else {
      const product = await this.productModel.findById(dto.productId);
      if (product && dto.quantity > product.stockQuantity) {
        throw new BadRequestException(
          `Cannot set quantity to ${dto.quantity}. Only ${product.stockQuantity} in stock.`,
        );
      }
      cart.items[existingIndex].quantity = dto.quantity;
    }

    await cart.save();
    return this.getCart(buyerId);
  }

  async removeItem(buyerId: string, productId: string) {
    const cart = await this.getOrCreateCart(buyerId);
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
    await cart.save();
    return this.getCart(buyerId);
  }

  async clearCart(buyerId: string) {
    const cart = await this.getOrCreateCart(buyerId);
    cart.items = [];
    await cart.save();
    return { success: true, message: 'Cart cleared successfully' };
  }
}
