'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export default function NewExpensePage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-gray-600 mt-2">
          Record a new expense transaction
        </p>
      </div>

      <div className="max-w-2xl">
        <ExpenseForm mode="create" />
      </div>
    </div>
  );
}
