import { useState, useEffect } from 'react';
import { Category } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  const loadCategories = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  return {
    categories,
    isLoading,
    error,
    reload: loadCategories,
  };
}
