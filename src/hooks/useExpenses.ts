import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilters } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

export function useExpenses(initialFilters: ExpenseFilters = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters);

  const { user, token } = useAuth();

  const loadExpenses = useCallback(async () => {
    if (!user || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/expenses?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [user, token, filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    isLoading,
    error,
    filters,
    setFilters,
    reload: loadExpenses,
  };
}
