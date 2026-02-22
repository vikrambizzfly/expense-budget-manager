import { getStorageAdapter } from '../storage/LocalStorageAdapter';
import { Collections } from '../storage/StorageInterface';
import { Category, CategoryFormData, UserRole } from '@/types/models';
import { PermissionChecker } from '../auth/permissions';
import { v4 as uuidv4 } from 'uuid';

export class CategoryService {
  private storage = getStorageAdapter();

  /**
   * Get all active categories
   */
  async getAllCategories(): Promise<Category[]> {
    const categories = await this.storage.query<Category>(
      Collections.CATEGORIES,
      (cat) => cat.isActive
    );
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    return this.storage.get<Category>(Collections.CATEGORIES, id);
  }

  /**
   * Create a new category (Admin only)
   */
  async createCategory(
    data: CategoryFormData,
    userId: string,
    userRole: UserRole
  ): Promise<Category> {
    // Check permissions
    if (!PermissionChecker.canManageCategories(userRole)) {
      throw new Error('Unauthorized: Only admins can create categories');
    }

    // Check if category name already exists
    const existing = await this.storage.query<Category>(
      Collections.CATEGORIES,
      (cat) => cat.name.toLowerCase() === data.name.toLowerCase() && cat.isActive
    );

    if (existing.length > 0) {
      throw new Error('A category with this name already exists');
    }

    const now = new Date().toISOString();
    const category: Category = {
      id: uuidv4(),
      ...data,
      isDefault: false,
      isActive: true,
      createdBy: userId,
      createdAt: now,
    };

    await this.storage.create(Collections.CATEGORIES, category);
    return category;
  }

  /**
   * Update a category (Admin only)
   */
  async updateCategory(
    id: string,
    data: Partial<CategoryFormData>,
    userRole: UserRole
  ): Promise<Category> {
    // Check permissions
    if (!PermissionChecker.canManageCategories(userRole)) {
      throw new Error('Unauthorized: Only admins can update categories');
    }

    const category = await this.storage.get<Category>(Collections.CATEGORIES, id);

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if renaming to an existing name
    if (data.name && data.name !== category.name) {
      const existing = await this.storage.query<Category>(
        Collections.CATEGORIES,
        (cat) =>
          cat.name.toLowerCase() === data.name!.toLowerCase() &&
          cat.id !== id &&
          cat.isActive
      );

      if (existing.length > 0) {
        throw new Error('A category with this name already exists');
      }
    }

    return this.storage.update<Category>(Collections.CATEGORIES, id, data);
  }

  /**
   * Delete a category (Admin only, cannot delete default categories)
   */
  async deleteCategory(id: string, userRole: UserRole): Promise<void> {
    // Check permissions
    if (!PermissionChecker.canManageCategories(userRole)) {
      throw new Error('Unauthorized: Only admins can delete categories');
    }

    const category = await this.storage.get<Category>(Collections.CATEGORIES, id);

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.isDefault) {
      throw new Error('Cannot delete default categories');
    }

    // Soft delete
    await this.storage.update<Category>(Collections.CATEGORIES, id, {
      isActive: false,
    } as Partial<Category>);
  }
}

// Singleton instance
let categoryServiceInstance: CategoryService | null = null;

export function getCategoryService(): CategoryService {
  if (!categoryServiceInstance) {
    categoryServiceInstance = new CategoryService();
  }
  return categoryServiceInstance;
}
