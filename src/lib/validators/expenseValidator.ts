import { z } from 'zod';
import { PaymentMethod } from '@/types/models';

export const expenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(999999.99, 'Amount cannot exceed $999,999.99'),
  date: z.string().min(1, 'Date is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description cannot exceed 200 characters'),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  referenceId: z
    .string()
    .max(50, 'Reference ID cannot exceed 50 characters')
    .optional(),
});

export type ExpenseFormValidation = z.infer<typeof expenseSchema>;

export function validateExpense(data: any) {
  return expenseSchema.safeParse(data);
}
