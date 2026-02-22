import { useState, useEffect } from 'react';
import { Category } from '@/types/models';
import { getCategoryService } from '@/lib/services/CategoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryService = getCategoryService();

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    reload: loadCategories,
  };
}
