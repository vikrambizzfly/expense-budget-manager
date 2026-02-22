import * as XLSX from 'xlsx';
import { Expense, Category, Budget, User } from '@/types/models';
import { centsToDollars } from '../utils/currency';
import { formatDate } from '../utils/date';
import { toTitleCase } from '../utils/formatting';

export class ExcelExporter {
  /**
   * Export expenses to Excel with multiple sheets
   */
  static exportExpenses(
    expenses: Expense[],
    categories: Category[],
    budgets: Budget[],
    filename: string = 'expenses-export.xlsx'
  ): void {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = this.generateSummarySheet(expenses, categories, budgets);
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Expenses
    const expensesData = this.generateExpensesSheet(expenses, categories);
    const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

    // Sheet 3: Category Breakdown
    const categoryData = this.generateCategoryBreakdownSheet(
      expenses,
      categories
    );
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');

    // Sheet 4: Budgets
    if (budgets.length > 0) {
      const budgetData = this.generateBudgetsSheet(budgets, categories);
      const budgetSheet = XLSX.utils.json_to_sheet(budgetData);
      XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Budgets');
    }

    // Generate and download
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Generate summary sheet data
   */
  private static generateSummarySheet(
    expenses: Expense[],
    categories: Category[],
    budgets: Budget[]
  ): any[][] {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = expenses.length;
    const avgExpense = expenseCount > 0 ? total / expenseCount : 0;

    const today = new Date().toLocaleDateString();

    return [
      ['Expense Report Summary'],
      ['Generated:', today],
      [],
      ['Total Expenses:', `$${centsToDollars(total).toFixed(2)}`],
      ['Number of Transactions:', expenseCount],
      ['Average Transaction:', `$${centsToDollars(avgExpense).toFixed(2)}`],
      ['Number of Categories:', categories.length],
      ['Active Budgets:', budgets.filter((b) => b.isActive).length],
      [],
      ['Date Range:'],
      [
        'From:',
        expenses.length > 0
          ? formatDate(
              expenses.sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )[0].date
            )
          : 'N/A',
      ],
      [
        'To:',
        expenses.length > 0
          ? formatDate(
              expenses.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0].date
            )
          : 'N/A',
      ],
    ];
  }

  /**
   * Generate expenses sheet data
   */
  private static generateExpensesSheet(
    expenses: Expense[],
    categories: Category[]
  ): any[] {
    return expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((expense) => {
        const category = categories.find((c) => c.id === expense.categoryId);
        return {
          Date: formatDate(expense.date, 'yyyy-MM-dd'),
          Description: expense.description,
          Category: category?.name || 'Unknown',
          Amount: centsToDollars(expense.amount),
          'Payment Method': expense.paymentMethod
            ? toTitleCase(expense.paymentMethod)
            : 'N/A',
          Notes: expense.notes || '',
          'Reference ID': expense.referenceId || '',
        };
      });
  }

  /**
   * Generate category breakdown sheet data
   */
  private static generateCategoryBreakdownSheet(
    expenses: Expense[],
    categories: Category[]
  ): any[] {
    const categoryTotals = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.categoryId) || 0;
      const count = categoryCounts.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, current + expense.amount);
      categoryCounts.set(expense.categoryId, count + 1);
    });

    const total = Array.from(categoryTotals.values()).reduce(
      (sum, amount) => sum + amount,
      0
    );

    const breakdown: any[] = [];

    categoryTotals.forEach((amount, categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      const count = categoryCounts.get(categoryId) || 0;
      const percentage = total > 0 ? (amount / total) * 100 : 0;

      if (category) {
        breakdown.push({
          Category: category.name,
          'Total Amount': centsToDollars(amount),
          Transactions: count,
          'Percentage of Total': `${percentage.toFixed(2)}%`,
          'Average per Transaction': centsToDollars(amount / count),
        });
      }
    });

    return breakdown.sort((a, b) => b['Total Amount'] - a['Total Amount']);
  }

  /**
   * Generate budgets sheet data
   */
  private static generateBudgetsSheet(
    budgets: Budget[],
    categories: Category[]
  ): any[] {
    return budgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      return {
        Category: category?.name || 'Unknown',
        Period: toTitleCase(budget.period),
        Amount: centsToDollars(budget.amount),
        'Start Date': formatDate(budget.startDate, 'yyyy-MM-dd'),
        'End Date': formatDate(budget.endDate, 'yyyy-MM-dd'),
        'Rollover Rule': toTitleCase(budget.rolloverRule.replace(/_/g, ' ')),
        'Alert at 80%': budget.alertAt80 ? 'Yes' : 'No',
        'Alert at 100%': budget.alertAt100 ? 'Yes' : 'No',
        Active: budget.isActive ? 'Yes' : 'No',
      };
    });
  }
}
