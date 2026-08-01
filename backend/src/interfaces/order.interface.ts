export interface ICheckoutItem {
  productId: string;
  quantity: number;
}

export interface ICheckoutData {
  items: ICheckoutItem[];
  shippingAddress: string;
}
