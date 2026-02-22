'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { ExcelExporter } from '@/lib/exports/ExcelExporter';
import { PDFExporter } from '@/lib/exports/PDFExporter';
import { CSVExporter } from '@/lib/exports/CSVExporter';
import { QuickDateRanges } from '@/lib/utils/date';
import { FileSpreadsheet, FileText, File, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

export default function ReportsPage() {
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { budgets, isLoading: budgetsLoading } = useBudgets();
  const { categories } = useCategories();
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState('30d');
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  if (expensesLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get selected date range
  const selectedRange = QuickDateRanges.find((r) => r.value === dateRange);
  const range = selectedRange?.getRange();

  // Filter expenses by date range
  const filteredExpenses = range
    ? expenses.filter((e) => {
        const expenseDate = new Date(e.date);
        return (
          expenseDate >= new Date(range.start) &&
          expenseDate <= new Date(range.end)
        );
      })
    : expenses;

  // Calculate stats
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const transactionCount = filteredExpenses.length;
  const categoriesUsed = new Set(
    filteredExpenses.map((e) => e.categoryId)
  ).size;

  const handleExport = () => {
    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `expenses-${timestamp}`;

      switch (exportFormat) {
        case 'excel':
          ExcelExporter.exportExpenses(
            filteredExpenses,
            categories,
            budgets,
            `${filename}.xlsx`
          );
          showToast('success', 'Excel report generated successfully');
          break;

        case 'pdf':
          PDFExporter.exportExpenses(
            filteredExpenses,
            categories,
            budgets,
            `${filename}.pdf`
          );
          showToast('success', 'PDF report generated successfully');
          break;

        case 'csv':
          CSVExporter.exportExpenses(
            filteredExpenses,
            categories,
            `${filename}.csv`
          );
          showToast('success', 'CSV export generated successfully');
          break;
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCategoryBreakdown = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      CSVExporter.exportCategoryBreakdown(
        filteredExpenses,
        categories,
        `category-breakdown-${timestamp}.csv`
      );
      showToast('success', 'Category breakdown exported successfully');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to export category breakdown');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">
          Export and generate comprehensive expense reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Export Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Configure and export your expense data
            </CardDescription>

            <div className="mt-6 space-y-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  options={QuickDateRanges.filter(
                    (r) => r.value !== 'custom'
                  ).map((r) => ({
                    label: r.label,
                    value: r.value,
                  }))}
                />
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setExportFormat('excel')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      exportFormat === 'excel'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileSpreadsheet
                      className={`w-8 h-8 mx-auto mb-2 ${
                        exportFormat === 'excel'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        exportFormat === 'excel'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      Excel
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Multi-sheet workbook
                    </p>
                  </button>

                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      exportFormat === 'pdf'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText
                      className={`w-8 h-8 mx-auto mb-2 ${
                        exportFormat === 'pdf'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        exportFormat === 'pdf'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      PDF
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatted report
                    </p>
                  </button>

                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      exportFormat === 'csv'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <File
                      className={`w-8 h-8 mx-auto mb-2 ${
                        exportFormat === 'csv'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        exportFormat === 'csv'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      CSV
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Raw data</p>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleExport}
                isLoading={isExporting}
                disabled={isExporting || filteredExpenses.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </Card>
        </div>

        {/* Report Preview/Stats */}
        <div>
          <Card>
            <CardTitle>Report Summary</CardTitle>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalSpent)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {transactionCount}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {categoriesUsed}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Period</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {selectedRange?.label || 'All time'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Export Options */}
      <Card>
        <CardTitle>Quick Exports</CardTitle>
        <CardDescription>
          Export specific data sets
        </CardDescription>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportCategoryBreakdown}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  Category Breakdown (CSV)
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Detailed spending by category
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setExportFormat('pdf');
              handleExport();
            }}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  Full Report (PDF)
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Complete expense report with summary
                </p>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}
