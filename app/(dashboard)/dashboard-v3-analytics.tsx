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
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, AlertCircle,
  Calendar, CreditCard, BarChart3, Activity, Target, Zap
} from 'lucide-react';

export default function DashboardV3Analytics() {
  const { user } = useAuth();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { budgetStatuses, isLoading: budgetsLoading } = useBudgets({ isActive: true });
  const { categories } = useCategories();

  if (expensesLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stats = ExpenseAnalyzer.getDashboardStats(expenses, budgetStatuses);
  const categoryBreakdown = ChartDataGenerator.generatePieChartData(expenses, categories);
  const monthlyTrend = ChartDataGenerator.generateMonthlyTrendData(expenses, 6);

  // Calculate additional insights
  const avgDailySpend = stats.monthlySpent / 30;
  const topCategory = categoryBreakdown[0];
  const budgetUtilization = budgetStatuses.length > 0
    ? budgetStatuses.reduce((sum, b) => sum + b.percentageUsed, 0) / budgetStatuses.length
    : 0;

  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 rounded-2xl mb-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Financial Dashboard</p>
            <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/expenses/new" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Add Expense
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Spent */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ALL TIME</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalSpent)}</p>
          <p className="text-xs text-gray-500">Total Expenses</p>
        </div>

        {/* Monthly Spend */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">THIS MONTH</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.monthlySpent)}</p>
          <p className="text-xs text-gray-500">Avg. {formatCurrency(avgDailySpend)}/day</p>
        </div>

        {/* Budgets */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ACTIVE</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{budgetStatuses.length}</p>
          <p className="text-xs text-gray-500">{(budgetUtilization || 0).toFixed(0)}% avg. used</p>
        </div>

        {/* Budget Health */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${
              stats.budgetStatus.overBudget > 0 ? 'bg-red-50' :
              stats.budgetStatus.warning > 0 ? 'bg-yellow-50' : 'bg-green-50'
            }`}>
              <AlertCircle className={`w-5 h-5 ${
                stats.budgetStatus.overBudget > 0 ? 'text-red-600' :
                stats.budgetStatus.warning > 0 ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">STATUS</span>
          </div>
          <p className={`text-2xl font-bold mb-1 ${
            stats.budgetStatus.overBudget > 0 ? 'text-red-600' :
            stats.budgetStatus.warning > 0 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {stats.budgetStatus.overBudget > 0 ? 'Critical' :
             stats.budgetStatus.warning > 0 ? 'Warning' : 'Healthy'}
          </p>
          <p className="text-xs text-gray-500">{stats.budgetStatus.overBudget} over budget</p>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">TOP CATEGORY</p>
              <p className="text-lg font-bold text-blue-900">{topCategory?.category || 'N/A'}</p>
              <p className="text-xs text-blue-700">{topCategory?.percentage?.toFixed(0) || 0}% of spending</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-xs text-purple-600 font-medium mb-1">TRANSACTIONS</p>
              <p className="text-lg font-bold text-purple-900">{expenses.length}</p>
              <p className="text-xs text-purple-700">{stats.recentExpenses.length} recent</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-xs text-green-600 font-medium mb-1">SAVINGS RATE</p>
              <p className="text-lg font-bold text-green-900">
                {budgetStatuses.length > 0 ? (100 - (budgetUtilization || 0)).toFixed(0) : 0}%
              </p>
              <p className="text-xs text-green-700">Under budget avg.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Spending Trend</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded">6 MONTHS</span>
          </div>
          <LineChartComponent data={monthlyTrend} title="" color="#3b82f6" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Category Split</h3>
          </div>
          <PieChartComponent data={categoryBreakdown} title="" />
        </div>
      </div>

      {/* Recent Activity & Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <Link href="/expenses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          {stats.recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No expenses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => {
                const category = categories.find((c) => c.id === expense.categoryId);
                return (
                  <div key={expense.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: category?.color + '20' }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                      <p className="text-xs text-gray-500">{category?.name} • {formatDate(expense.date)}</p>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Budget Performance</h3>
            <Link href="/budgets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Manage →
            </Link>
          </div>
          {budgetStatuses.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No budgets set</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetStatuses.slice(0, 5).map((status) => (
                <div key={status.budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{status.categoryName}</span>
                      {status.percentageUsed >= 100 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">OVER</span>
                      )}
                      {status.percentageUsed >= 80 && status.percentageUsed < 100 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">WARNING</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {status.percentageUsed.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          status.percentageUsed >= 100 ? 'bg-red-600' :
                          status.percentageUsed >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(status.spent)} of {formatCurrency(status.budget.amount)} • {formatCurrency(status.remaining)} left
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
