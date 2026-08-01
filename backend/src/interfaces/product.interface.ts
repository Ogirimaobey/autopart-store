export interface ICreateProductData {
  vendorId: string;
  categoryId: string;
  brandId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  condition: 'NEW' | 'USED';
  images?: string[];
}

export interface IUpdateProductData {
  categoryId?: string;
  brandId?: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  condition?: 'NEW' | 'USED';
  images?: string[];
}
