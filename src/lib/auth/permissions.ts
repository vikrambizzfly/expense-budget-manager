import { UserRole } from '@/types/models';

/**
 * Permission checking utilities based on user roles
 */

export interface PermissionContext {
  userId: string;
  role: UserRole;
}

/**
 * Check if user has permission to perform an action
 */
export class PermissionChecker {
  /**
   * Check if user is an admin
   */
  static isAdmin(role: UserRole): boolean {
    return role === UserRole.ADMIN;
  }

  /**
   * Check if user is an accountant or admin
   */
  static isAccountantOrAdmin(role: UserRole): boolean {
    return role === UserRole.ACCOUNTANT || role === UserRole.ADMIN;
  }

  /**
   * Check if user can view all users' data
   */
  static canViewAllData(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.ACCOUNTANT;
  }

  /**
   * Check if user can edit expenses
   */
  static canEditExpense(
    userRole: UserRole,
    expenseOwnerId: string,
    currentUserId: string
  ): boolean {
    // Admin and Accountant can edit any expense
    if (this.isAccountantOrAdmin(userRole)) {
      return true;
    }

    // Regular users can only edit their own expenses
    return expenseOwnerId === currentUserId;
  }

  /**
   * Check if user can delete expenses
   */
  static canDeleteExpense(
    userRole: UserRole,
    expenseOwnerId: string,
    currentUserId: string
  ): boolean {
    // Admin can delete any expense
    if (this.isAdmin(userRole)) {
      return true;
    }

    // Regular users and accountants can only delete their own expenses
    return expenseOwnerId === currentUserId;
  }

  /**
   * Check if user can view expenses
   */
  static canViewExpense(
    userRole: UserRole,
    expenseOwnerId: string,
    currentUserId: string
  ): boolean {
    // Admin and Accountant can view all expenses
    if (this.canViewAllData(userRole)) {
      return true;
    }

    // Regular users can only view their own expenses
    return expenseOwnerId === currentUserId;
  }

  /**
   * Check if user can manage budgets
   */
  static canManageBudget(
    userRole: UserRole,
    budgetOwnerId: string,
    currentUserId: string
  ): boolean {
    // Admin can manage all budgets
    if (this.isAdmin(userRole)) {
      return true;
    }

    // Regular users can only manage their own budgets
    // Accountants can only view, not edit budgets
    return budgetOwnerId === currentUserId;
  }

  /**
   * Check if user can view budgets
   */
  static canViewBudget(
    userRole: UserRole,
    budgetOwnerId: string,
    currentUserId: string
  ): boolean {
    // Admin and Accountant can view all budgets
    if (this.canViewAllData(userRole)) {
      return true;
    }

    // Regular users can only view their own budgets
    return budgetOwnerId === currentUserId;
  }

  /**
   * Check if user can manage categories
   */
  static canManageCategories(role: UserRole): boolean {
    return this.isAdmin(role);
  }

  /**
   * Check if user can manage users
   */
  static canManageUsers(role: UserRole): boolean {
    return this.isAdmin(role);
  }

  /**
   * Check if user can view audit logs
   */
  static canViewAuditLogs(role: UserRole): boolean {
    return this.isAccountantOrAdmin(role);
  }

  /**
   * Check if user can export reports
   */
  static canExportReports(role: UserRole): boolean {
    // All roles can export their own data
    // Admin and Accountant can export all data
    return true;
  }

  /**
   * Filter data based on user permissions
   */
  static filterByPermissions<T extends { userId: string }>(
    data: T[],
    context: PermissionContext
  ): T[] {
    // Admin and Accountant can see all data
    if (this.canViewAllData(context.role)) {
      return data;
    }

    // Regular users can only see their own data
    return data.filter((item) => item.userId === context.userId);
  }
}

/**
 * Route protection levels
 */
export enum ProtectionLevel {
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated',
  ACCOUNTANT = 'accountant',
  ADMIN = 'admin',
}

/**
 * Check if user role meets the required protection level
 */
export function hasRequiredRole(
  userRole: UserRole,
  requiredLevel: ProtectionLevel
): boolean {
  switch (requiredLevel) {
    case ProtectionLevel.PUBLIC:
      return true;

    case ProtectionLevel.AUTHENTICATED:
      return true; // If user has a role, they're authenticated

    case ProtectionLevel.ACCOUNTANT:
      return (
        userRole === UserRole.ACCOUNTANT ||
        userRole === UserRole.ADMIN
      );

    case ProtectionLevel.ADMIN:
      return userRole === UserRole.ADMIN;

    default:
      return false;
  }
}

/**
 * Route configuration with protection levels
 */
export const RouteProtection = {
  '/login': ProtectionLevel.PUBLIC,
  '/register': ProtectionLevel.PUBLIC,
  '/': ProtectionLevel.AUTHENTICATED,
  '/expenses': ProtectionLevel.AUTHENTICATED,
  '/budgets': ProtectionLevel.AUTHENTICATED,
  '/reports': ProtectionLevel.AUTHENTICATED,
  '/analytics': ProtectionLevel.AUTHENTICATED,
  '/categories': ProtectionLevel.ADMIN,
  '/users': ProtectionLevel.ADMIN,
  '/audit': ProtectionLevel.ACCOUNTANT,
} as const;
