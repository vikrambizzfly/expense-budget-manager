import {
  Expense,
  Category,
  BudgetStatus,
  DateRange,
} from '@/types/models';
import { isDateInRange } from '../utils/date';

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface BudgetComparisonData {
  name: string;
  budgeted: number;
  actual: number;
  remaining: number;
}

export class ChartDataGenerator {
  /**
   * Generate pie chart data for category breakdown
   */
  static generatePieChartData(
    expenses: Expense[],
    categories: Category[],
    dateRange?: DateRange
  ): ChartDataPoint[] {
    // Filter by date range if provided
    const filteredExpenses = dateRange
      ? expenses.filter((e) => isDateInRange(e.date, dateRange))
      : expenses;

    // Group by category
    const categoryTotals = new Map<string, { amount: number; color: string }>();

    filteredExpenses.forEach((expense) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      if (category) {
        const current = categoryTotals.get(category.name) || {
          amount: 0,
          color: category.color,
        };
        categoryTotals.set(category.name, {
          amount: current.amount + expense.amount,
          color: category.color,
        });
      }
    });

    // Convert to chart data
    return Array.from(categoryTotals.entries())
      .map(([name, { amount, color }]) => ({
        name,
        value: amount,
        color,
      }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Generate bar chart data for budget vs actual
   */
  static generateBudgetComparisonData(
    budgetStatuses: BudgetStatus[]
  ): BudgetComparisonData[] {
    return budgetStatuses.map((status) => ({
      name: status.categoryName,
      budgeted: status.budget.amount,
      actual: status.spent,
      remaining: Math.max(0, status.remaining),
    }));
  }

  /**
   * Generate line chart data for monthly trend
   */
  static generateMonthlyTrendData(
    expenses: Expense[],
    monthsBack: number = 6
  ): ChartDataPoint[] {
    const now = new Date();
    const monthlyData = new Map<string, number>();

    // Initialize all months
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, 0);
    }

    // Aggregate expenses by month
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        monthlyData.set(key, (monthlyData.get(key) || 0) + expense.amount);
      }
    });

    // Convert to chart data
    return Array.from(monthlyData.entries())
      .map(([month, amount]) => {
        // Format month for display
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        const monthName = date.toLocaleString('default', { month: 'short' });

        return {
          name: monthName,
          value: amount,
          month,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Generate area chart data for cumulative spending
   */
  static generateCumulativeSpendingData(
    expenses: Expense[],
    dateRange: DateRange
  ): ChartDataPoint[] {
    // Filter and sort expenses by date
    const filteredExpenses = expenses
      .filter((e) => isDateInRange(e.date, dateRange))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filteredExpenses.length === 0) return [];

    // Generate daily cumulative totals
    const dailyTotals = new Map<string, number>();
    let cumulative = 0;

    filteredExpenses.forEach((expense) => {
      const date = expense.date.split('T')[0]; // Get YYYY-MM-DD
      cumulative += expense.amount;
      dailyTotals.set(date, cumulative);
    });

    // Convert to chart data
    return Array.from(dailyTotals.entries()).map(([date, amount]) => ({
      name: new Date(date).toLocaleDateString('default', {
        month: 'short',
        day: 'numeric',
      }),
      value: amount,
      date,
    }));
  }
}
