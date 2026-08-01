import Brand, { IBrand } from '../models/brand.model';
import { ICreateBrandData, IUpdateBrandData } from '../interfaces/brand.interface';

class BrandService {
  public async createBrand(data: ICreateBrandData): Promise<IBrand> {
    const brandExists = await Brand.findOne({ name: data.name });
    if (brandExists) throw new Error('Brand already exists');

    return await Brand.create(data);
  }

  public async getBrands(): Promise<IBrand[]> {
    return await Brand.find({});
  }

  public async getBrandById(id: string): Promise<IBrand> {
    const brand = await Brand.findById(id);
    if (!brand) throw new Error('Brand not found');
    return brand;
  }

  public async updateBrand(id: string, data: IUpdateBrandData): Promise<IBrand> {
    const brand = await Brand.findByIdAndUpdate(id, data, { new: true });
    if (!brand) throw new Error('Brand not found');
    return brand;
  }

  public async deleteBrand(id: string): Promise<void> {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) throw new Error('Brand not found');
  }
}

export default new BrandService();
