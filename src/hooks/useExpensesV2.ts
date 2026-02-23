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
    initialPageParam: undefined,
    enabled: enabled && !!token,
    staleTime: 60 * 1000, // 1 minute
  });

  // Flatten all pages into single array - ensure it's always an array
  const expenses = query.data?.pages?.flatMap((page) => page?.expenses ?? []) ?? [];

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('useExpensesV2:', {
      hasData: !!query.data,
      pagesCount: query.data?.pages?.length,
      expensesCount: expenses.length,
      isArray: Array.isArray(expenses),
    });
  }

  // Delete mutation with optimistic updates
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
    // Optimistic update - remove from UI immediately
    onMutate: async (expenseId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['expenses', { categoryId, startDate, endDate, search, paymentMethod }]);

      // Optimistically update to remove the expense
      queryClient.setQueryData(
        ['expenses', { categoryId, startDate, endDate, search, paymentMethod }],
        (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: ExpensesResponse) => ({
              ...page,
              expenses: page.expenses.filter((exp: Expense) => exp.id !== expenseId),
            })),
          };
        }
      );

      // Return context for rollback
      return { previousData };
    },
    // Rollback on error
    onError: (err, expenseId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['expenses', { categoryId, startDate, endDate, search, paymentMethod }],
          context.previousData
        );
      }
    },
    // Always refetch after error or success
    onSettled: () => {
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
