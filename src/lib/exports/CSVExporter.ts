import { Expense, Category } from '@/types/models';
import { centsToDollars } from '../utils/currency';
import { formatDate } from '../utils/date';
import { toTitleCase } from '../utils/formatting';

export class CSVExporter {
  /**
   * Export expenses to CSV
   */
  static exportExpenses(
    expenses: Expense[],
    categories: Category[],
    filename: string = 'expenses-export.csv'
  ): void {
    // Generate CSV content
    const headers = [
      'Date',
      'Description',
      'Category',
      'Amount',
      'Payment Method',
      'Notes',
      'Reference ID',
    ];

    const rows = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((expense) => {
        const category = categories.find((c) => c.id === expense.categoryId);
        return [
          formatDate(expense.date, 'yyyy-MM-dd'),
          this.escapeCsvValue(expense.description),
          category?.name || 'Unknown',
          centsToDollars(expense.amount).toFixed(2),
          expense.paymentMethod ? toTitleCase(expense.paymentMethod) : '',
          this.escapeCsvValue(expense.notes || ''),
          expense.referenceId || '',
        ];
      });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    // Create download
    this.downloadCSV(csvContent, filename);
  }

  /**
   * Export category breakdown to CSV
   */
  static exportCategoryBreakdown(
    expenses: Expense[],
    categories: Category[],
    filename: string = 'category-breakdown.csv'
  ): void {
    const categoryTotals = new Map<string, { count: number; amount: number }>();

    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.categoryId) || {
        count: 0,
        amount: 0,
      };
      categoryTotals.set(expense.categoryId, {
        count: current.count + 1,
        amount: current.amount + expense.amount,
      });
    });

    const total = Array.from(categoryTotals.values()).reduce(
      (sum, data) => sum + data.amount,
      0
    );

    const headers = [
      'Category',
      'Total Amount',
      'Transactions',
      'Percentage',
      'Average per Transaction',
    ];

    const rows: any[] = [];
    categoryTotals.forEach((data, categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
      const avg = data.count > 0 ? data.amount / data.count : 0;

      if (category) {
        rows.push([
          category.name,
          centsToDollars(data.amount).toFixed(2),
          data.count,
          percentage.toFixed(2) + '%',
          centsToDollars(avg).toFixed(2),
        ]);
      }
    });

    // Sort by amount descending
    rows.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    this.downloadCSV(csvContent, filename);
  }

  /**
   * Escape CSV values
   */
  private static escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Download CSV file
   */
  private static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
