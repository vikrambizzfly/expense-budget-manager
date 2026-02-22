import { z } from 'zod';
import { BudgetPeriod, BudgetRolloverRule } from '@/types/models';

export const budgetSchema = z
  .object({
    categoryId: z.string().min(1, 'Category is required'),
    period: z.nativeEnum(BudgetPeriod),
    amount: z
      .number()
      .positive('Amount must be greater than 0')
      .max(999999.99, 'Amount cannot exceed $999,999.99'),
    rolloverRule: z.nativeEnum(BudgetRolloverRule),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    alertAt80: z.boolean(),
    alertAt100: z.boolean(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type BudgetFormValidation = z.infer<typeof budgetSchema>;

export function validateBudget(data: any) {
  return budgetSchema.safeParse(data);
}
