'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { getExpenseService } from '@/lib/services/ExpenseService';
import { useAuth } from '@/contexts/AuthContext';
import { Expense } from '@/types/models';

export default function EditExpensePage() {
  const params = useParams();
  const { user } = useAuth();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const expenseService = getExpenseService();

  useEffect(() => {
    const loadExpense = async () => {
      if (!user || !params.id) return;

      try {
        const data = await expenseService.getExpenseById(
          params.id as string,
          { userId: user.id, role: user.role }
        );

        if (!data) {
          setError('Expense not found');
        } else {
          setExpense(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load expense');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpense();
  }, [user, params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div>
        <Link
          href="/expenses"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Expenses
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Expense not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/expenses"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Expenses
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Expense</h1>
        <p className="text-gray-600 mt-2">
          Update expense details
        </p>
      </div>

      <div className="max-w-2xl">
        <ExpenseForm mode="edit" expense={expense} />
      </div>
    </div>
  );
}
