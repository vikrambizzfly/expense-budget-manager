'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { ExpenseAnalyzer } from '@/lib/analytics/ExpenseAnalyzer';
import { ChartDataGenerator } from '@/lib/analytics/ChartDataGenerator';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { AlertTriangle, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
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

  // Calculate dashboard stats
  const stats = ExpenseAnalyzer.getDashboardStats(expenses, budgetStatuses);
  const categoryBreakdown = ChartDataGenerator.generatePieChartData(
    expenses,
    categories
  );
  const monthlyTrend = ChartDataGenerator.generateMonthlyTrendData(expenses, 6);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here's your financial overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {formatCurrency(stats.totalSpent)}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {formatCurrency(stats.monthlySpent)}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Current month</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <PiggyBank className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardDescription>Active Budgets</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {budgetStatuses.length}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {stats.budgetStatus.onTrack} on track
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                stats.budgetStatus.overBudget > 0
                  ? 'bg-red-100'
                  : stats.budgetStatus.warning > 0
                  ? 'bg-yellow-100'
                  : 'bg-green-100'
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  stats.budgetStatus.overBudget > 0
                    ? 'text-red-600'
                    : stats.budgetStatus.warning > 0
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              />
            </div>
            <div>
              <CardDescription>Budget Status</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {stats.budgetStatus.overBudget > 0 ? (
                  <span className="text-red-600">Over Budget</span>
                ) : stats.budgetStatus.warning > 0 ? (
                  <span className="text-yellow-600">Warning</span>
                ) : (
                  <span className="text-green-600">On Track</span>
                )}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {stats.budgetStatus.overBudget} over budget
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
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
            title="Monthly Spending Trend"
            color="#3b82f6"
          />
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle>Recent Expenses</CardTitle>
          {stats.recentExpenses.length === 0 ? (
            <p className="text-sm text-gray-500 mt-4 text-center py-8">
              No expenses yet. Add your first expense to get started!
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.recentExpenses.map((expense) => {
                const category = categories.find(
                  (c) => c.id === expense.categoryId
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category?.color || '#gray' }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {expense.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {category?.name} • {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                );
              })}
              <Link
                href="/expenses"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-3"
              >
                View all expenses →
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Budget Overview</CardTitle>
          {budgetStatuses.length === 0 ? (
            <p className="text-sm text-gray-500 mt-4 text-center py-8">
              No budgets yet. Create your first budget to track spending!
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {budgetStatuses.slice(0, 5).map((status) => (
                <div key={status.budget.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {status.categoryName}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(status.spent)} /{' '}
                      {formatCurrency(status.budget.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.percentageUsed >= 100
                          ? 'bg-red-500'
                          : status.percentageUsed >= 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(status.percentageUsed, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {status.percentageUsed.toFixed(0)}% used
                  </p>
                </div>
              ))}
              <Link
                href="/budgets"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 pt-3"
              >
                View all budgets →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
