import { useState, useEffect, useCallback } from 'react';
import { Budget, BudgetFilters, BudgetStatus } from '@/types/models';
import { getBudgetService } from '@/lib/services/BudgetService';
import { useAuth } from '@/contexts/AuthContext';

export function useBudgets(initialFilters: BudgetFilters = {}) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BudgetFilters>(initialFilters);

  const { user } = useAuth();
  const budgetService = getBudgetService();

  const loadBudgets = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const [budgetsData, statusesData] = await Promise.all([
        budgetService.getBudgets(filters, {
          userId: user.id,
          role: user.role,
        }),
        budgetService.getBudgetStatuses(filters, {
          userId: user.id,
          role: user.role,
        }),
      ]);

      setBudgets(budgetsData);
      setBudgetStatuses(statusesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgets,
    budgetStatuses,
    isLoading,
    error,
    filters,
    setFilters,
    reload: loadBudgets,
  };
}
