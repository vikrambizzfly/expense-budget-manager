'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { getExpenseService } from '@/lib/services/ExpenseService';
import { validateExpense } from '@/lib/validators/expenseValidator';
import { Expense, ExpenseFormData, PaymentMethod } from '@/types/models';
import { PAYMENT_METHOD_OPTIONS } from '@/types/forms';
import { centsToDollars } from '@/lib/utils/currency';
import { getTodayInputDate, formatInputDate } from '@/lib/utils/date';

interface ExpenseFormProps {
  expense?: Expense;
  mode: 'create' | 'edit';
}

export function ExpenseForm({ expense, mode }: ExpenseFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState<ExpenseFormData>({
    categoryId: expense?.categoryId || '',
    amount: expense ? centsToDollars(expense.amount) : 0,
    date: expense ? formatInputDate(expense.date) : getTodayInputDate(),
    description: expense?.description || '',
    paymentMethod: expense?.paymentMethod,
    notes: expense?.notes || '',
    referenceId: expense?.referenceId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseService = getExpenseService();

  useEffect(() => {
    // Set first category as default if none selected
    if (!formData.categoryId && categories.length > 0) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formData.categoryId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});

    // Validate
    const validation = validateExpense(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await expenseService.createExpense(formData, user.id);
        showToast('success', 'Expense created successfully');
      } else if (expense) {
        await expenseService.updateExpense(
          expense.id,
          formData,
          { userId: user.id, role: user.role }
        );
        showToast('success', 'Expense updated successfully');
      }

      router.push('/expenses');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Category"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          options={categories.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }))}
          error={errors.categoryId}
          required
        />

        <Input
          label="Amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          required
          step="0.01"
          min="0"
        />

        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
        />

        <Input
          label="Description"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          required
          maxLength={200}
        />

        <Select
          label="Payment Method"
          name="paymentMethod"
          value={formData.paymentMethod || ''}
          onChange={handleChange}
          options={[
            { label: 'Select payment method...', value: '' },
            ...PAYMENT_METHOD_OPTIONS,
          ]}
          error={errors.paymentMethod}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            maxLength={500}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
        </div>

        <Input
          label="Reference ID"
          type="text"
          name="referenceId"
          value={formData.referenceId}
          onChange={handleChange}
          error={errors.referenceId}
          maxLength={50}
          helperText="Optional reference number or transaction ID"
        />

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {mode === 'create' ? 'Create Expense' : 'Update Expense'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/expenses')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
