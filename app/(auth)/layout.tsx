import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense & Budget Manager
          </h1>
          <p className="text-gray-600">
            Track expenses, manage budgets, stay on top of your finances
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
