'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { ExpenseAnalyzer } from '@/lib/analytics/ExpenseAnalyzer';
import { ChartDataGenerator } from '@/lib/analytics/ChartDataGenerator';
import { QuickDateRanges } from '@/lib/utils/date';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/currency';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { budgetStatuses, isLoading: budgetsLoading } = useBudgets({ isActive: true });
  const { categories } = useCategories();

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

  // Generate chart data
  const categoryBreakdown = ChartDataGenerator.generatePieChartData(
    filteredExpenses,
    categories,
    range
  );

  const monthlyTrend = ChartDataGenerator.generateMonthlyTrendData(
    filteredExpenses,
    6
  );

  const budgetComparison = ChartDataGenerator.generateBudgetComparisonData(
    budgetStatuses
  );

  const paymentMethodData = ExpenseAnalyzer.getSpendingByPaymentMethod(
    filteredExpenses
  ).map((item) => ({
    name: item.method,
    value: item.amount,
  }));

  // Calculate summary stats
  const totalSpent = filteredExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );
  const avgDailySpending =
    ExpenseAnalyzer.getAverageDailySpending(filteredExpenses);
  const expenseCount = filteredExpenses.length;
  const avgExpenseAmount = expenseCount > 0 ? totalSpent / expenseCount : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Detailed insights into your spending patterns
          </p>
        </div>

        <div className="w-48">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={QuickDateRanges.filter((r) => r.value !== 'custom').map(
              (r) => ({
                label: r.label,
                value: r.value,
              })
            )}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(totalSpent)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Avg. Daily</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(Math.round(avgDailySpending))}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {expenseCount}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">Avg. Transaction</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(Math.round(avgExpenseAmount))}
          </p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <PieChartComponent
            data={categoryBreakdown}
            title="Spending by Category"
          />
        </Card>

        <Card>
          <LineChartComponent
            data={monthlyTrend}
            title="Monthly Spending Trend (Last 6 Months)"
            color="#3b82f6"
          />
        </Card>

        <Card>
          <BarChartComponent
            data={budgetComparison}
            title="Budget vs Actual Spending"
            dataKeys={[
              { key: 'budgeted', color: '#93c5fd', label: 'Budgeted' },
              { key: 'actual', color: '#3b82f6', label: 'Actual' },
            ]}
          />
        </Card>

        <Card>
          <PieChartComponent
            data={paymentMethodData}
            title="Spending by Payment Method"
          />
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card>
        <CardTitle>Category Breakdown</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                  Percentage
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item, index) => {
                const categoryExpenses = filteredExpenses.filter((e) => {
                  const cat = categories.find((c) => c.id === e.categoryId);
                  return cat?.name === item.name;
                });
                const percentage = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;

                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      {categoryExpenses.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
