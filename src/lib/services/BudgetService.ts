import { getStorageAdapter } from '../storage/LocalStorageAdapter';
import { Collections } from '../storage/StorageInterface';
import {
  Budget,
  BudgetFormData,
  BudgetFilters,
  BudgetStatus,
  UserRole,
  Category,
  Expense,
  User,
} from '@/types/models';
import { PermissionChecker, PermissionContext } from '../auth/permissions';
import { dollarsToCents } from '../utils/currency';
import { BudgetCalculator } from '../budget/BudgetCalculator';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from './AuditService';

export class BudgetService {
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
   * Get all budgets with filters and permissions
   */
  async getBudgets(
    filters: BudgetFilters = {},
    context: PermissionContext
  ): Promise<Budget[]> {
    let budgets = await this.storage.getAll<Budget>(Collections.BUDGETS);

    // Apply permission filtering
    if (context.role === UserRole.USER) {
      budgets = budgets.filter((b) => b.userId === context.userId);
    } else if (filters.userId) {
      budgets = budgets.filter((b) => b.userId === filters.userId);
    }

    // Apply additional filters
    if (filters.categoryId) {
      budgets = budgets.filter((b) => b.categoryId === filters.categoryId);
    }

    if (filters.period) {
      budgets = budgets.filter((b) => b.period === filters.period);
    }

    if (filters.isActive !== undefined) {
      budgets = budgets.filter((b) => b.isActive === filters.isActive);
    }

    return budgets;
  }

  /**
   * Get budget by ID
   */
  async getBudgetById(
    id: string,
    context: PermissionContext
  ): Promise<Budget | null> {
    const budget = await this.storage.get<Budget>(Collections.BUDGETS, id);

    if (!budget) {
      return null;
    }

    // Check permissions
    if (
      !PermissionChecker.canViewBudget(
        context.role,
        budget.userId,
        context.userId
      )
    ) {
      throw new Error('Unauthorized: Cannot view this budget');
    }

    return budget;
  }

  /**
   * Create a new budget
   */
  async createBudget(
    data: BudgetFormData,
    userId: string
  ): Promise<Budget> {
    // Validate category exists
    const category = await this.storage.get<Category>(
      Collections.CATEGORIES,
      data.categoryId
    );

    if (!category || !category.isActive) {
      throw new Error('Invalid category');
    }

    // Check for existing active budget for same category and period
    const existing = await this.storage.query<Budget>(
      Collections.BUDGETS,
      (b) =>
        b.userId === userId &&
        b.categoryId === data.categoryId &&
        b.period === data.period &&
        b.isActive &&
        // Check for overlapping dates
        new Date(data.startDate) <= new Date(b.endDate) &&
        new Date(data.endDate) >= new Date(b.startDate)
    );

    if (existing.length > 0) {
      throw new Error(
        'An active budget already exists for this category and period'
      );
    }

    const now = new Date().toISOString();
    const budget: Budget = {
      id: uuidv4(),
      userId,
      categoryId: data.categoryId,
      period: data.period,
      amount: dollarsToCents(data.amount), // Convert to cents
      rolloverRule: data.rolloverRule,
      startDate: data.startDate,
      endDate: data.endDate,
      alertAt80: data.alertAt80,
      alertAt100: data.alertAt100,
      isActive: true,
      createdAt: now,
    };

    await this.storage.create(Collections.BUDGETS, budget);

    // Log audit trail
    const user = await this.getUserForAudit(userId);
    await this.auditService.logCreate('budget', budget.id, user, budget);

    return budget;
  }

  /**
   * Update a budget
   */
  async updateBudget(
    id: string,
    data: Partial<BudgetFormData>,
    context: PermissionContext
  ): Promise<Budget> {
    const budget = await this.storage.get<Budget>(Collections.BUDGETS, id);

    if (!budget) {
      throw new Error('Budget not found');
    }

    // Check permissions
    if (
      !PermissionChecker.canManageBudget(
        context.role,
        budget.userId,
        context.userId
      )
    ) {
      throw new Error('Unauthorized: Cannot edit this budget');
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
    const oldData = { ...budget };

    // Prepare update data
    const updateData: any = { ...data };

    // Convert amount to cents if provided
    if (data.amount !== undefined) {
      updateData.amount = dollarsToCents(data.amount);
    }

    const updated = await this.storage.update<Budget>(Collections.BUDGETS, id, updateData);

    // Log audit trail
    const user = await this.getUserForAudit(context.userId);
    await this.auditService.logUpdate('budget', id, user, oldData, updated);

    return updated;
  }

  /**
   * Delete a budget
   */
  async deleteBudget(id: string, context: PermissionContext): Promise<void> {
    const budget = await this.storage.get<Budget>(Collections.BUDGETS, id);

    if (!budget) {
      throw new Error('Budget not found');
    }

    // Check permissions
    if (
      !PermissionChecker.canManageBudget(
        context.role,
        budget.userId,
        context.userId
      )
    ) {
      throw new Error('Unauthorized: Cannot delete this budget');
    }

    // Store deleted data for audit
    const deletedData = { ...budget };

    await this.storage.delete(Collections.BUDGETS, id);

    // Log audit trail
    const user = await this.getUserForAudit(context.userId);
    await this.auditService.logDelete('budget', id, user, deletedData);
  }

  /**
   * Get budget statuses (with spending calculations)
   */
  async getBudgetStatuses(
    filters: BudgetFilters,
    context: PermissionContext
  ): Promise<BudgetStatus[]> {
    const budgets = await this.getBudgets(filters, context);
    const expenses = await this.storage.getAll<Expense>(Collections.EXPENSES);
    const categories = await this.storage.getAll<Category>(
      Collections.CATEGORIES
    );

    return BudgetCalculator.calculateMultipleBudgetStatuses(
      budgets,
      expenses,
      categories
    );
  }

  /**
   * Deactivate a budget
   */
  async deactivateBudget(
    id: string,
    context: PermissionContext
  ): Promise<Budget> {
    return this.updateBudget(id, { isActive: false } as Partial<BudgetFormData>, context);
  }
}

// Singleton instance
let budgetServiceInstance: BudgetService | null = null;

export function getBudgetService(): BudgetService {
  if (!budgetServiceInstance) {
    budgetServiceInstance = new BudgetService();
  }
  return budgetServiceInstance;
}
