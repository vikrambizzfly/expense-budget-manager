import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, ExpenseFilters } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

interface ExpensesResponse {
  expenses: Expense[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface UseExpensesOptions extends ExpenseFilters {
  limit?: number;
  enabled?: boolean;
}

export function useExpensesV2(options: UseExpensesOptions = {}) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const {
    categoryId,
    startDate,
    endDate,
    search,
    paymentMethod,
    limit = 50,
    enabled = true,
  } = options;

  const fetchExpenses = async ({ pageParam }: { pageParam?: string }) => {
    if (!token) throw new Error('No authentication token');

    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (search) params.append('search', search);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);
    if (pageParam) params.append('cursor', pageParam);
    params.append('limit', limit.toString());

    const response = await fetch(`/api/expenses?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }

    return response.json() as Promise<ExpensesResponse>;
  };

  const query = useInfiniteQuery({
    queryKey: ['expenses', { categoryId, startDate, endDate, search, paymentMethod }],
    queryFn: fetchExpenses,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && !!token,
    staleTime: 60 * 1000, // 1 minute
  });

  // Flatten all pages into single array
  const expenses = query.data?.pages.flatMap((page) => page.expenses) ?? [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete expense');
      }

      return expenseId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  return {
    expenses,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    deleteExpense: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
