'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  FileText,
  Tag,
  Users,
  FileSearch,
  LogOut,
} from 'lucide-react';
import { UserRole } from '@/types/models';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredRole?: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    label: 'Budgets',
    href: '/budgets',
    icon: <PiggyBank className="w-5 h-5" />,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: <Tag className="w-5 h-5" />,
    requiredRole: [UserRole.ADMIN],
  },
  {
    label: 'Users',
    href: '/users',
    icon: <Users className="w-5 h-5" />,
    requiredRole: [UserRole.ADMIN],
  },
  {
    label: 'Audit Log',
    href: '/audit',
    icon: <FileSearch className="w-5 h-5" />,
    requiredRole: [UserRole.ADMIN, UserRole.ACCOUNTANT],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(user?.role as UserRole);
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Expense Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
