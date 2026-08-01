import Product, { IProduct } from '../models/product.model';
import { ICreateProductData, IUpdateProductData } from '../interfaces/product.interface';

class ProductService {
  public async createProduct(data: ICreateProductData): Promise<IProduct> {
    return await Product.create(data as any);
  }

  public async getProducts(query: any): Promise<IProduct[]> {
    // Basic filtering based on query params (e.g., ?category=xxx&brand=yyy)
    const filter: any = {};
    if (query.category) filter.categoryId = query.category;
    if (query.brand) filter.brandId = query.brand;
    if (query.vendor) filter.vendorId = query.vendor;
    if (query.condition) filter.condition = query.condition;

    return await Product.find(filter)
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .populate('vendorId', 'fullName storeName');
  }

  public async getProductById(id: string): Promise<IProduct> {
    const product = await Product.findById(id)
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .populate('vendorId', 'fullName storeName');
      
    if (!product) throw new Error('Product not found');
    return product;
  }

  public async updateProduct(id: string, vendorId: string, data: IUpdateProductData): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
    
    // Ensure only the vendor who owns the product can update it
    if (product.vendorId.toString() !== vendorId) {
      throw new Error('Not authorized to update this product');
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
    return updatedProduct as IProduct;
  }

  public async deleteProduct(id: string, vendorId: string, role: string): Promise<void> {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');

    // Admin can delete any product, Vendor can only delete their own
    if (role !== 'ADMIN' && product.vendorId.toString() !== vendorId) {
      throw new Error('Not authorized to delete this product');
    }

    await Product.findByIdAndDelete(id);
  }
}

export default new ProductService();
