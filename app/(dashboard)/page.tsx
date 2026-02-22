'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}! Here's your financial overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl mt-2">$0.00</CardTitle>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </Card>

        <Card>
          <CardDescription>This Month</CardDescription>
          <CardTitle className="text-2xl mt-2">$0.00</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Current month</p>
        </Card>

        <Card>
          <CardDescription>Budgets</CardDescription>
          <CardTitle className="text-2xl mt-2">0</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Active budgets</p>
        </Card>

        <Card>
          <CardDescription>Budget Status</CardDescription>
          <CardTitle className="text-2xl mt-2 text-green-600">On Track</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Overall status</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardTitle>Recent Expenses</CardTitle>
          <p className="text-sm text-gray-500 mt-4 text-center py-8">
            No expenses yet. Add your first expense to get started!
          </p>
        </Card>

        <Card>
          <CardTitle>Budget Overview</CardTitle>
          <p className="text-sm text-gray-500 mt-4 text-center py-8">
            No budgets yet. Create your first budget to track spending!
          </p>
        </Card>
      </div>
    </div>
  );
}
