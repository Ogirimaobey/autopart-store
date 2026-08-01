import Category, { ICategory } from '../models/category.model';
import { ICreateCategoryData, IUpdateCategoryData } from '../interfaces/category.interface';

class CategoryService {
  public async createCategory(data: ICreateCategoryData): Promise<ICategory> {
    const categoryExists = await Category.findOne({ name: data.name });
    if (categoryExists) throw new Error('Category already exists');

    return await Category.create(data);
  }

  public async getCategories(): Promise<ICategory[]> {
    return await Category.find({});
  }

  public async getCategoryById(id: string): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  public async updateCategory(id: string, data: IUpdateCategoryData): Promise<ICategory> {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new Error('Category not found');
    return category;
  }

  public async deleteCategory(id: string): Promise<void> {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error('Category not found');
  }
}

export default new CategoryService();
