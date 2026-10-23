export type Role = 'buyer' | 'supplier' | 'admin';

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'pending' | 'suspended';
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface SupplierProfile {
  id: string;
  _id?: string;
  user: string | User;
  businessName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  cacNumber?: string;
  description?: string;
  logoUrl?: string;
  verifiedBadge: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedAt?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategory?: Category | string;
  displayOrder: number;
  isActive: boolean;
}

export interface VehicleBrand {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  country?: string;
  logoUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface VehicleModel {
  id: string;
  _id?: string;
  vehicleBrand: string | VehicleBrand;
  name: string;
  slug: string;
  yearStart: number;
  yearEnd?: number;
  popularEngineCodes: string[];
  isActive: boolean;
}

export interface PartBrand {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isOem: boolean;
  country?: string;
  countryOfOrigin?: string;
  isActive: boolean;
}

export interface CompatibleVehicle {
  vehicleBrand?: string | VehicleBrand;
  vehicleBrandName: string;
  vehicleModel: string;
  yearStart: number;
  yearEnd?: number;
  engineTypes: string[];
  engineNumbers: string[];
}

export type ProductCondition = 'new' | 'used' | 'refurbished';
export type ProductStatus = 'active' | 'out-of-stock' | 'archived';

export interface Product {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  discountPrice?: number;
  effectivePrice?: number;
  stockQuantity: number;
  condition: ProductCondition;
  category: Category;
  partBrand: PartBrand;
  compatibleVehicles: CompatibleVehicle[];
  supplier: User;
  status: ProductStatus;
  viewsCount: number;
  salesCount: number;
  partNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemProduct {
  id: string;
  title: string;
  slug: string;
  images: string[];
  price: number;
  discountPrice?: number;
  effectivePrice: number;
  stockQuantity: number;
  status: ProductStatus;
  condition: ProductCondition;
  partNumber?: string;
  category?: Category;
  partBrand?: PartBrand;
}

export interface CartSupplierGroup {
  supplier: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    businessName?: string;
  };
  items: Array<{
    product: CartItemProduct;
    quantity: number;
    subtotal: number;
    inStock: boolean;
    addedAt: string;
  }>;
  supplierSubtotal: number;
  itemCount: number;
}

export interface CartResponse {
  cartId: string;
  buyerId: string;
  totalItems: number;
  grandTotal: number;
  supplierGroups: CartSupplierGroup[];
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderLineItem {
  product: string | Product;
  title: string;
  slug: string;
  partNumber?: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  checkoutSessionId: string;
  buyer: User;
  supplier: User;
  items: OrderLineItem[];
  itemsSubtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    notes?: string;
  };
  deliveryType: 'shipping' | 'pickup';
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paidAt?: string;
  statusHistory: Array<{
    status: OrderStatus;
    changedAt: string;
    note?: string;
  }>;
  supplierNotes?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  _id?: string;
  buyer: User;
  supplier: User;
  product: Product;
  subject: string;
  status: 'open' | 'responded' | 'closed';
  messages: Array<{
    sender: User | { _id: string; fullName: string; role: Role };
    message: string;
    createdAt: string;
  }>;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}
