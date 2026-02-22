import { getStorageAdapter } from '../storage/LocalStorageAdapter';
import { Collections } from '../storage/StorageInterface';
import {
  Expense,
  ExpenseFormData,
  ExpenseFilters,
  UserRole,
  Category,
  User,
} from '@/types/models';
import { PermissionChecker, PermissionContext } from '../auth/permissions';
import { dollarsToCents } from '../utils/currency';
import { isDateInRange } from '../utils/date';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from './AuditService';

export class ExpenseService {
  private storage = getStorageAdapter();
  private auditService = new AuditService();

  /**
   * Helper to get user for audit logging
   */
  private async getUserForAudit(userId: string): Promise<User> {
    const user = await this.storage.get<User>(Collections.USERS, userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Get all expenses with filters and permissions
   */
  async getExpenses(
    filters: ExpenseFilters = {},
    context: PermissionContext
  ): Promise<Expense[]> {
    let expenses = await this.storage.getAll<Expense>(Collections.EXPENSES);

    // Apply permission filtering first
    expenses = PermissionChecker.filterByPermissions(expenses, context);

    // Apply additional filters
    if (filters.categoryId) {
      expenses = expenses.filter((e) => e.categoryId === filters.categoryId);
    }

    if (filters.startDate && filters.endDate) {
      expenses = expenses.filter((e) =>
        isDateInRange(e.date, {
          start: filters.startDate!,
          end: filters.endDate!,
        })
      );
    }

    if (filters.minAmount !== undefined) {
      expenses = expenses.filter((e) => e.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      expenses = expenses.filter((e) => e.amount <= filters.maxAmount!);
    }

    if (filters.paymentMethod) {
      expenses = expenses.filter((e) => e.paymentMethod === filters.paymentMethod);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      expenses = expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(searchLower) ||
          e.notes?.toLowerCase().includes(searchLower) ||
          e.referenceId?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return expenses;
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(
    id: string,
    context: PermissionContext
  ): Promise<Expense | null> {
    const expense = await this.storage.get<Expense>(Collections.EXPENSES, id);

    if (!expense) {
      return null;
    }

    // Check permissions
    if (
      !PermissionChecker.canViewExpense(
        context.role,
        expense.userId,
        context.userId
      )
    ) {
      throw new Error('Unauthorized: Cannot view this expense');
    }

    return expense;
  }

  /**
   * Create a new expense
   */
  async createExpense(
    data: ExpenseFormData,
    userId: string
  ): Promise<Expense> {
    // Validate category exists
    const category = await this.storage.get<Category>(
      Collections.CATEGORIES,
      data.categoryId
    );

    if (!category || !category.isActive) {
      throw new Error('Invalid category');
    }

    const now = new Date().toISOString();
    const expense: Expense = {
      id: uuidv4(),
      userId,
      categoryId: data.categoryId,
      amount: dollarsToCents(data.amount), // Convert to cents
      date: data.date,
      description: data.description,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      referenceId: data.referenceId,
      createdBy: userId,
      createdAt: now,
    };

    await this.storage.create(Collections.EXPENSES, expense);

    // Log audit trail
    const user = await this.getUserForAudit(userId);
    await this.auditService.logCreate('expense', expense.id, user, expense);

    return expense;
  }

  /**
   * Update an expense
   */
  async updateExpense(
    id: string,
    data: Partial<ExpenseFormData>,
    context: PermissionContext
  ): Promise<Expense> {
    const expense = await this.storage.get<Expense>(Collections.EXPENSES, id);

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check permissions
    if (
      !PermissionChecker.canEditExpense(
        context.role,
        expense.userId,
        context.userId
      )
    ) {
      throw new Error('Unauthorized: Cannot edit this expense');
    }

    // Validate category if being changed
    if (data.categoryId) {
      const category = await this.storage.get<Category>(
        Collections.CATEGORIES,
        data.categoryId
      );

      if (!category || !category.isActive) {
        throw new Error('Invalid category');
      }
    }

    // Store old data for audit
    const oldData = { ...expense };

    // Prepare update data
    const updateData: any = { ...data };

    // Convert amount to cents if provided
    if (data.amount !== undefined) {
      updateData.amount = dollarsToCents(data.amount);
    }

    updateData.updatedBy = context.userId;
    updateData.updatedAt = new Date().toISOString();

    const updated = await this.storage.update<Expense>(Collections.EXPENSES, id, updateData);

    // Log audit trail
    const user = await this.getUserForAudit(context.userId);
    await this.auditService.logUpdate('expense', id, user, oldData, updated);

    return updated;
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string, context: PermissionContext): Promise<void> {
    const expense = await this.storage.get<Expense>(Collections.EXPENSES, id);

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check permissions
    if (
      !PermissionChecker.canDeleteExpense(
        context.role,
        expense.userId,
        context.userId
      )
    ) {
      throw new Error('Unauthorized: Cannot delete this expense');
    }

    // Store deleted data for audit
    const deletedData = { ...expense };

    await this.storage.delete(Collections.EXPENSES, id);

    // Log audit trail
    const user = await this.getUserForAudit(context.userId);
    await this.auditService.logDelete('expense', id, user, deletedData);
  }

  /**
   * Get total expenses for a user and optional filters
   */
  async getTotalExpenses(
    filters: ExpenseFilters,
    context: PermissionContext
  ): Promise<number> {
    const expenses = await this.getExpenses(filters, context);
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(
    categoryId: string,
    context: PermissionContext
  ): Promise<Expense[]> {
    return this.getExpenses({ categoryId }, context);
  }

  /**
   * Get expenses for a date range
   */
  async getExpensesByDateRange(
    startDate: string,
    endDate: string,
    context: PermissionContext
  ): Promise<Expense[]> {
    return this.getExpenses({ startDate, endDate }, context);
  }
}

// Singleton instance
let expenseServiceInstance: ExpenseService | null = null;

export function getExpenseService(): ExpenseService {
  if (!expenseServiceInstance) {
    expenseServiceInstance = new ExpenseService();
  }
  return expenseServiceInstance;
}
