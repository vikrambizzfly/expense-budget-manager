'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { ExpenseAnalyzer } from '@/lib/analytics/ExpenseAnalyzer';
import { ChartDataGenerator } from '@/lib/analytics/ChartDataGenerator';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import { ArrowRight, Circle } from 'lucide-react';

export default function DashboardV2Minimal() {
  const { user } = useAuth();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { budgetStatuses, isLoading: budgetsLoading } = useBudgets({ isActive: true });
  const { categories } = useCategories();

  if (expensesLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-3 text-center">
          <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce mx-auto"></div>
          <p className="text-sm text-gray-500 font-light">Loading your dashboard</p>
        </div>
      </div>
    );
  }

  const stats = ExpenseAnalyzer.getDashboardStats(expenses, budgetStatuses);
  const categoryBreakdown = ChartDataGenerator.generatePieChartData(expenses, categories);
  const monthlyTrend = ChartDataGenerator.generateMonthlyTrendData(expenses, 6);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Minimal Header */}
      <div className="mb-16 pt-8">
        <p className="text-sm text-gray-500 font-light mb-2">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</p>
        <h1 className="text-5xl font-light text-gray-900 tracking-tight">{user?.name}</h1>
      </div>

      {/* Clean Stats - Minimal Cards */}
      <div className="grid grid-cols-4 gap-12 mb-20">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Total</p>
          <p className="text-4xl font-light text-gray-900">{formatCurrency(stats.totalSpent)}</p>
          <p className="text-sm text-gray-500 font-light">All time</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">This Month</p>
          <p className="text-4xl font-light text-gray-900">{formatCurrency(stats.monthlySpent)}</p>
          <p className="text-sm text-gray-500 font-light">Current period</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Budgets</p>
          <p className="text-4xl font-light text-gray-900">{budgetStatuses.length}</p>
          <p className="text-sm text-gray-500 font-light">{stats.budgetStatus.onTrack} on track</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Status</p>
          <p className={`text-4xl font-light ${
            stats.budgetStatus.overBudget > 0 ? 'text-red-900' :
            stats.budgetStatus.warning > 0 ? 'text-orange-900' : 'text-green-900'
          }`}>
            {stats.budgetStatus.overBudget > 0 ? 'Alert' : stats.budgetStatus.warning > 0 ? 'Warning' : 'Healthy'}
          </p>
          <p className="text-sm text-gray-500 font-light">Budget health</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-16"></div>

      {/* Analytics Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-light text-gray-900 mb-8">Analytics</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="bg-white border border-gray-200 rounded-sm p-8">
            <PieChartComponent data={categoryBreakdown} title="Spending by Category" />
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-8">
            <LineChartComponent data={monthlyTrend} title="Monthly Trend" color="#111827" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-16"></div>

      {/* Activity Section */}
      <div className="grid grid-cols-2 gap-16 mb-16">
        {/* Recent Expenses */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-gray-900">Recent Activity</h2>
            <Link href="/expenses" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {stats.recentExpenses.length === 0 ? (
            <p className="text-gray-400 font-light">No expenses yet</p>
          ) : (
            <div className="space-y-6">
              {stats.recentExpenses.map((expense) => {
                const category = categories.find((c) => c.id === expense.categoryId);
                return (
                  <div key={expense.id} className="flex items-start justify-between border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <Circle className="w-2 h-2 mt-2 flex-shrink-0" style={{ color: category?.color, fill: category?.color }} />
                      <div>
                        <p className="font-light text-gray-900 mb-1">{expense.description}</p>
                        <p className="text-sm text-gray-500 font-light">{category?.name}</p>
                        <p className="text-xs text-gray-400 font-light mt-1">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <span className="font-light text-gray-900 text-lg">{formatCurrency(expense.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget Overview */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-gray-900">Budget Overview</h2>
            <Link href="/budgets" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {budgetStatuses.length === 0 ? (
            <p className="text-gray-400 font-light">No budgets yet</p>
          ) : (
            <div className="space-y-8">
              {budgetStatuses.slice(0, 5).map((status) => (
                <div key={status.budget.id}>
                  <div className="flex justify-between mb-3">
                    <span className="font-light text-gray-900">{status.categoryName}</span>
                    <span className="text-sm text-gray-500 font-light">
                      {formatCurrency(status.spent)} / {formatCurrency(status.budget.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-1 transition-all ${
                        status.percentageUsed >= 100 ? 'bg-red-900' :
                        status.percentageUsed >= 80 ? 'bg-orange-900' : 'bg-gray-900'
                      }`}
                      style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 font-light mt-2">{status.percentageUsed.toFixed(0)}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
