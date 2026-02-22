import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, Category, Budget } from '@/types/models';
import { centsToDollars, formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { toTitleCase } from '../utils/formatting';

export class PDFExporter {
  /**
   * Export expenses to PDF
   */
  static exportExpenses(
    expenses: Expense[],
    categories: Category[],
    budgets: Budget[],
    filename: string = 'expenses-report.pdf'
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );

    yPosition += 15;

    // Summary Statistics
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = expenses.length;
    const avgExpense = expenseCount > 0 ? total / expenseCount : 0;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Expenses: ${formatCurrency(total)}`, 14, yPosition);
    yPosition += 6;
    doc.text(`Number of Transactions: ${expenseCount}`, 14, yPosition);
    yPosition += 6;
    doc.text(
      `Average Transaction: ${formatCurrency(Math.round(avgExpense))}`,
      14,
      yPosition
    );
    yPosition += 6;
    doc.text(`Active Budgets: ${budgets.filter((b) => b.isActive).length}`, 14, yPosition);

    yPosition += 10;

    // Expenses Table
    if (expenses.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Expense Details', 14, yPosition);
      yPosition += 5;

      const expenseData = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 50) // Limit to first 50 for PDF
        .map((expense) => {
          const category = categories.find((c) => c.id === expense.categoryId);
          return [
            formatDate(expense.date, 'MMM dd, yyyy'),
            expense.description.substring(0, 30),
            category?.name || 'Unknown',
            formatCurrency(expense.amount),
          ];
        });

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Category', 'Amount']],
        body: expenseData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Category Breakdown (new page if needed)
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    const categoryTotals = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, current + expense.amount);
    });

    const totalAmount = Array.from(categoryTotals.values()).reduce(
      (sum, amount) => sum + amount,
      0
    );

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Breakdown', 14, yPosition);
    yPosition += 5;

    const categoryData: any[] = [];
    categoryTotals.forEach((amount, categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      if (category) {
        categoryData.push([
          category.name,
          formatCurrency(amount),
          `${percentage.toFixed(1)}%`,
        ]);
      }
    });

    categoryData.sort((a, b) => {
      const amountA = parseFloat(a[1].replace(/[$,]/g, ''));
      const amountB = parseFloat(b[1].replace(/[$,]/g, ''));
      return amountB - amountA;
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    // Save
    doc.save(filename);
  }
}
