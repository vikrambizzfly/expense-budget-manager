import {
  Budget,
  BudgetRolloverRule,
  BudgetPeriod,
} from '@/types/models';
import {
  addMonths,
  addYears,
  endOfMonth,
  endOfYear,
} from 'date-fns';

export class RolloverManager {
  /**
   * Calculate rollover amount based on budget rule
   */
  static calculateRollover(
    budget: Budget,
    spent: number,
    remaining: number
  ): number {
    switch (budget.rolloverRule) {
      case BudgetRolloverRule.NO_ROLLOVER:
        return 0;

      case BudgetRolloverRule.ROLLOVER_SURPLUS:
        // Only rollover if under budget
        return remaining > 0 ? remaining : 0;

      case BudgetRolloverRule.ROLLOVER_ALL:
        // Rollover everything, including deficit
        return remaining;

      default:
        return 0;
    }
  }

  /**
   * Create a new budget for the next period with rollover
   */
  static createNextPeriodBudget(
    budget: Budget,
    rolloverAmount: number
  ): Omit<Budget, 'id' | 'createdAt'> {
    const startDate = new Date(budget.endDate);
    startDate.setDate(startDate.getDate() + 1); // Start the day after end date

    let endDate: Date;

    if (budget.period === BudgetPeriod.MONTHLY) {
      endDate = endOfMonth(addMonths(startDate, 1));
    } else {
      endDate = endOfYear(addYears(startDate, 1));
    }

    return {
      userId: budget.userId,
      categoryId: budget.categoryId,
      period: budget.period,
      amount: budget.amount + rolloverAmount,
      rolloverRule: budget.rolloverRule,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      alertAt80: budget.alertAt80,
      alertAt100: budget.alertAt100,
      isActive: true,
    };
  }

  /**
   * Check if a budget period has ended
   */
  static hasBudgetPeriodEnded(budget: Budget): boolean {
    const now = new Date();
    const endDate = new Date(budget.endDate);
    return now > endDate;
  }
}
