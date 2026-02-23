'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, X, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useExpensesV2 } from '@/hooks/useExpensesV2';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { toTitleCase } from '@/lib/utils/formatting';
import { Expense, PaymentMethod } from '@/types/models';
import { PAYMENT_METHOD_OPTIONS } from '@/types/forms';

export default function ExpensesPageV2() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { categories } = useCategories();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<{ totalCount: number; totalAmount: number } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch stats (total count and amount)
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      const params = new URLSearchParams();
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (startDateFilter) params.append('startDate', startDateFilter);
      if (endDateFilter) params.append('endDate', endDateFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/expenses/stats?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [user?.id, categoryFilter, startDateFilter, endDateFilter, debouncedSearch, paymentMethodFilter]);

  // Use improved hook
  const {
    expenses,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    deleteExpense,
    isDeleting,
  } = useExpensesV2({
    search: debouncedSearch,
    categoryId: categoryFilter,
    paymentMethod: paymentMethodFilter as PaymentMethod,
    startDate: startDateFilter,
    endDate: endDateFilter,
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDelete = async (expense: Expense) => {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this expense: ${expense.description}?`
    );

    if (!confirmed) return;

    try {
      deleteExpense(expense.id);
      showToast('success', 'Expense deleted successfully');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete expense');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPaymentMethodFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const hasActiveFilters = searchQuery || categoryFilter || paymentMethodFilter || startDateFilter || endDateFilter;

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#6b7280';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="text-center p-8">
          <p className="text-red-600 mb-4">Failed to load expenses</p>
          <p className="text-gray-600 text-sm">{error?.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your expenses
          </p>
        </div>
        <Link href="/expenses/new">
          <Button className="shadow-lg hover:shadow-xl transition-shadow">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses by description, notes, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  Active
                </span>
              )}
            </button>

            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear all
                </button>
              )}
              <span className="text-sm text-gray-600">
                {expenses.length} expenses
              </span>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Methods</option>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Card className="text-center py-12">
          {hasActiveFilters ? (
            <>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No expenses found matching your filters</p>
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No expenses yet</p>
              <Link href="/expenses/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Expense
                </Button>
              </Link>
            </>
          )}
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <Card key={expense.id} padding={false} className="hover:shadow-lg transition-shadow">
                <div className="p-5 flex items-center gap-4">
                  {/* Category Indicator */}
                  <div
                    className="w-1 h-14 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
                  />

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {expense.description}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <span className="font-medium" style={{ color: getCategoryColor(expense.categoryId) }}>
                            {getCategoryName(expense.categoryId)}
                          </span>
                          {expense.paymentMethod && (
                            <>
                              <span>•</span>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>{toTitleCase(expense.paymentMethod)}</span>
                            </>
                          )}
                          <span>•</span>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(expense.date)}</span>
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {expense.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/expenses/${expense.id}/edit`}>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expense)}
                      disabled={isDeleting}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="py-8 text-center">
            {isFetchingNextPage && (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            )}
            {!hasNextPage && expenses.length > 10 && (
              <p className="text-gray-500 text-sm">No more expenses to load</p>
            )}
          </div>

          {/* Total */}
          <Card className="mt-6 sticky bottom-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stats ? `Showing ${expenses.length} of ${stats.totalCount}` : `${expenses.length} loaded`}
                  {hasNextPage && ' • Scroll for more'}
                </p>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stats ? formatCurrency(stats.totalAmount) : formatCurrency(Array.isArray(expenses) ? expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0)}
              </span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
