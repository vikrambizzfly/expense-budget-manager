import {
  Budget,
  Expense,
  BudgetStatus,
  AlertLevel,
  Category,
} from '@/types/models';
import { isDateInRange } from '../utils/date';

export class BudgetCalculator {
  /**
   * Calculate budget status for a single budget
   */
  static calculateBudgetStatus(
    budget: Budget,
    expenses: Expense[],
    category: Category
  ): BudgetStatus {
    // Filter expenses for this budget's period
    const relevantExpenses = expenses.filter(
      (expense) =>
        expense.categoryId === budget.categoryId &&
        expense.userId === budget.userId &&
        isDateInRange(expense.date, {
          start: budget.startDate,
          end: budget.endDate,
        })
    );

    // Calculate total spent
    const spent = relevantExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate remaining
    const remaining = budget.amount - spent;

    // Calculate percentage used
    const percentageUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    // Determine alert level
    let alertLevel: AlertLevel = AlertLevel.NONE;
    if (percentageUsed >= 100 && budget.alertAt100) {
      alertLevel = AlertLevel.CRITICAL;
    } else if (percentageUsed >= 80 && budget.alertAt80) {
      alertLevel = AlertLevel.WARNING;
    }

    return {
      budget,
      spent,
      remaining,
      percentageUsed: Math.min(percentageUsed, 999), // Cap at 999%
      alertLevel,
      categoryName: category.name,
    };
  }

  /**
   * Calculate budget statuses for multiple budgets
   */
  static calculateMultipleBudgetStatuses(
    budgets: Budget[],
    expenses: Expense[],
    categories: Category[]
  ): BudgetStatus[] {
    return budgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      return this.calculateBudgetStatus(
        budget,
        expenses,
        category || {
          id: budget.categoryId,
          name: 'Unknown',
          description: '',
          color: '#gray',
          icon: 'package',
          isDefault: false,
          isActive: true,
          createdBy: '',
          createdAt: '',
        }
      );
    });
  }

  /**
   * Get budget summary statistics
   */
  static getBudgetSummary(budgetStatuses: BudgetStatus[]): {
    onTrack: number;
    warning: number;
    overBudget: number;
  } {
    return {
      onTrack: budgetStatuses.filter((b) => b.alertLevel === AlertLevel.NONE)
        .length,
      warning: budgetStatuses.filter((b) => b.alertLevel === AlertLevel.WARNING)
        .length,
      overBudget: budgetStatuses.filter(
        (b) => b.alertLevel === AlertLevel.CRITICAL
      ).length,
    };
  }
}
