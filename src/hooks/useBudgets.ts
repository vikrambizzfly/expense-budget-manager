import { useState, useEffect, useCallback } from 'react';
import { BudgetStatus, BudgetFilters } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

export function useBudgets(initialFilters: BudgetFilters = {}) {
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BudgetFilters>(initialFilters);

  const { user, token } = useAuth();

  const loadBudgets = useCallback(async () => {
    if (!user || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load budgets');
      }

      const data = await response.json();
      setBudgetStatuses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgetStatuses,
    isLoading,
    error,
    filters,
    setFilters,
    reload: loadBudgets,
  };
}
