import {
  Expense,
  Category,
  Budget,
  BudgetStatus,
  CategoryBreakdownData,
  MonthlyTrendData,
  BudgetVsActualData,
  DashboardStats,
} from '@/types/models';
import { getMonthYear } from '../utils/date';
import { BudgetCalculator } from '../budget/BudgetCalculator';

export class ExpenseAnalyzer {
  /**
   * Calculate category breakdown from expenses
   */
  static getCategoryBreakdown(
    expenses: Expense[],
    categories: Category[]
  ): CategoryBreakdownData[] {
    // Group expenses by category
    const categoryTotals = new Map<string, number>();

    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, current + expense.amount);
    });

    // Calculate total
    const total = Array.from(categoryTotals.values()).reduce(
      (sum, amount) => sum + amount,
      0
    );

    // Create breakdown data
    const breakdown: CategoryBreakdownData[] = [];

    categoryTotals.forEach((amount, categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        breakdown.push({
          category: category.name,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          color: category.color,
        });
      }
    });

    // Sort by amount descending
    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Calculate monthly spending trend
   */
  static getMonthlyTrend(expenses: Expense[]): MonthlyTrendData[] {
    // Group expenses by month
    const monthlyTotals = new Map<string, number>();

    expenses.forEach((expense) => {
      const month = getMonthYear(expense.date);
      const current = monthlyTotals.get(month) || 0;
      monthlyTotals.set(month, current + expense.amount);
    });

    // Convert to array and sort by month
    const trend: MonthlyTrendData[] = Array.from(monthlyTotals.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return trend;
  }

  /**
   * Calculate budget vs actual spending
   */
  static getBudgetVsActual(
    budgetStatuses: BudgetStatus[]
  ): BudgetVsActualData[] {
    return budgetStatuses.map((status) => ({
      category: status.categoryName,
      budgeted: status.budget.amount,
      actual: status.spent,
      percentage: status.percentageUsed,
    }));
  }

  /**
   * Get dashboard statistics
   */
  static getDashboardStats(
    expenses: Expense[],
    budgetStatuses: BudgetStatus[]
  ): DashboardStats {
    // Calculate total spent (all time)
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate this month's spending
    const now = new Date();
    const currentMonth = getMonthYear(now.toISOString());
    const monthlySpent = expenses
      .filter((exp) => getMonthYear(exp.date) === currentMonth)
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Find top category
    const categoryTotals = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, current + expense.amount);
    });

    let topCategory: DashboardStats['topCategory'] = null;
    if (categoryTotals.size > 0) {
      const [topCategoryId, topAmount] = Array.from(categoryTotals.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0];

      const topCategoryExpenses = expenses.filter(
        (e) => e.categoryId === topCategoryId
      );
      const categoryName =
        topCategoryExpenses[0]?.categoryId || 'Unknown';

      topCategory = {
        name: categoryName,
        amount: topAmount,
        percentage: totalSpent > 0 ? (topAmount / totalSpent) * 100 : 0,
      };
    }

    // Calculate budget status summary
    const budgetSummary = BudgetCalculator.getBudgetSummary(budgetStatuses);

    // Get recent expenses (last 5)
    const recentExpenses = [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalSpent,
      monthlySpent,
      topCategory,
      budgetStatus: budgetSummary,
      recentExpenses,
    };
  }

  /**
   * Get spending by payment method
   */
  static getSpendingByPaymentMethod(
    expenses: Expense[]
  ): Array<{ method: string; amount: number; percentage: number }> {
    const methodTotals = new Map<string, number>();

    expenses.forEach((expense) => {
      const method = expense.paymentMethod || 'Not specified';
      const current = methodTotals.get(method) || 0;
      methodTotals.set(method, current + expense.amount);
    });

    const total = Array.from(methodTotals.values()).reduce(
      (sum, amount) => sum + amount,
      0
    );

    return Array.from(methodTotals.entries())
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get average daily spending
   */
  static getAverageDailySpending(expenses: Expense[]): number {
    if (expenses.length === 0) return 0;

    const dates = expenses.map((e) => new Date(e.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return total / daysDiff;
  }
}
