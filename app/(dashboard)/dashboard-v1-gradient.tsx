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
  AlertTriangle, TrendingUp, DollarSign, PiggyBank,
  ArrowUpRight, ArrowDownRight, Sparkles, Zap
} from 'lucide-react';

export default function DashboardV1Gradient() {
  const { user } = useAuth();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { budgetStatuses, isLoading: budgetsLoading } = useBudgets({ isActive: true });
  const { categories } = useCategories();

  if (expensesLoading || budgetsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0"></div>
        </div>
      </div>
    );
  }

  const stats = ExpenseAnalyzer.getDashboardStats(expenses, budgetStatuses);
  const categoryBreakdown = ChartDataGenerator.generatePieChartData(expenses, categories);
  const monthlyTrend = ChartDataGenerator.generateMonthlyTrendData(expenses, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
            <h1 className="text-4xl font-bold text-white">Welcome Back, {user?.name}!</h1>
          </div>
          <p className="text-purple-100 text-lg">Your financial journey at a glance ✨</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Glassmorphism Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Expenses */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <Zap className="w-5 h-5 text-blue-500 opacity-50" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Expenses</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(stats.totalSpent)}
            </p>
            <p className="text-xs text-gray-500 mt-2">All time spending</p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-500 opacity-50" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">This Month</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(stats.monthlySpent)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Current month</p>
          </div>
        </div>

        {/* Active Budgets */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-purple-500 opacity-50" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Active Budgets</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {budgetStatuses.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">{stats.budgetStatus.onTrack} on track</p>
          </div>
        </div>

        {/* Budget Status */}
        <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className={`absolute inset-0 ${
            stats.budgetStatus.overBudget > 0
              ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20'
              : stats.budgetStatus.warning > 0
              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
              : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
          } opacity-0 group-hover:opacity-100 transition-opacity`}></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl shadow-lg ${
                stats.budgetStatus.overBudget > 0
                  ? 'bg-gradient-to-br from-red-500 to-orange-600'
                  : stats.budgetStatus.warning > 0
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                  : 'bg-gradient-to-br from-green-500 to-emerald-600'
              }`}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Budget Health</p>
            <p className={`text-3xl font-bold ${
              stats.budgetStatus.overBudget > 0
                ? 'bg-gradient-to-r from-red-600 to-orange-600'
                : stats.budgetStatus.warning > 0
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                : 'bg-gradient-to-r from-green-600 to-emerald-600'
            } bg-clip-text text-transparent`}>
              {stats.budgetStatus.overBudget > 0 ? 'Over' : stats.budgetStatus.warning > 0 ? 'Warning' : 'Healthy'}
            </p>
            <p className="text-xs text-gray-500 mt-2">{stats.budgetStatus.overBudget} over budget</p>
          </div>
        </div>
      </div>

      {/* Charts with Glass Effect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <PieChartComponent data={categoryBreakdown} title="Spending by Category" />
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <LineChartComponent data={monthlyTrend} title="Monthly Trend" color="#8b5cf6" />
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Recent Expenses
          </h3>
          {stats.recentExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => {
                const category = categories.find((c) => c.id === expense.categoryId);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }}></div>
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">{category?.name} • {formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
                  </div>
                );
              })}
              <Link href="/expenses" className="block text-center text-purple-600 hover:text-purple-700 font-medium pt-3">
                View all →
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Budget Overview
          </h3>
          {budgetStatuses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No budgets yet</p>
          ) : (
            <div className="space-y-4">
              {budgetStatuses.slice(0, 5).map((status) => (
                <div key={status.budget.id} className="p-3 rounded-xl bg-white/50">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{status.categoryName}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(status.spent)} / {formatCurrency(status.budget.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        status.percentageUsed >= 100
                          ? 'bg-gradient-to-r from-red-500 to-orange-500'
                          : status.percentageUsed >= 80
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(status.percentageUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{status.percentageUsed.toFixed(0)}% used</p>
                </div>
              ))}
              <Link href="/budgets" className="block text-center text-blue-600 hover:text-blue-700 font-medium pt-3">
                View all →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
