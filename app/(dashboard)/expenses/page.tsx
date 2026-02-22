'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { toTitleCase } from '@/lib/utils/formatting';
import { getExpenseService } from '@/lib/services/ExpenseService';
import { Expense } from '@/types/models';

export default function ExpensesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { expenses, isLoading, reload } = useExpenses();
  const { categories } = useCategories();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const expenseService = getExpenseService();

  const handleDelete = async (expense: Expense) => {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this expense: ${expense.description}?`
    );

    if (!confirmed) return;

    setDeletingId(expense.id);

    try {
      await expenseService.deleteExpense(expense.id, {
        userId: user.id,
        role: user.role,
      });

      showToast('success', 'Expense deleted successfully');
      reload();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || '#gray';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your expenses
          </p>
        </div>
        <Link href="/expenses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Filters - Placeholder for future implementation */}
      <Card className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            Showing {expenses.length} expenses
          </span>
        </div>
        <Button variant="ghost" size="sm">
          Add Filters
        </Button>
      </Card>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No expenses found</p>
          <Link href="/expenses/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Expense
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id} padding={false}>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Category Color Indicator */}
                  <div
                    className="w-1 h-16 rounded-full"
                    style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {getCategoryName(expense.categoryId)}
                          {expense.paymentMethod && (
                            <span className="ml-2">
                              • {toTitleCase(expense.paymentMethod)}
                            </span>
                          )}
                        </p>
                        {expense.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>

                    {expense.referenceId && (
                      <p className="text-xs text-gray-400 mt-2">
                        Ref: {expense.referenceId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/expenses/${expense.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(expense)}
                    disabled={deletingId === expense.id}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Total */}
      {expenses.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                expenses.reduce((sum, exp) => sum + exp.amount, 0)
              )}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
