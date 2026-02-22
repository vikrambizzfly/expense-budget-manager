import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilters } from '@/types/models';
import { getExpenseService } from '@/lib/services/ExpenseService';
import { useAuth } from '@/contexts/AuthContext';

export function useExpenses(initialFilters: ExpenseFilters = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters);

  const { user } = useAuth();
  const expenseService = getExpenseService();

  const loadExpenses = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await expenseService.getExpenses(filters, {
        userId: user.id,
        role: user.role,
      });
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

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
