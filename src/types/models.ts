// Enums
export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  USER = 'user',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
  OTHER = 'other',
}

export enum BudgetPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export enum BudgetRolloverRule {
  NO_ROLLOVER = 'no_rollover',
  ROLLOVER_SURPLUS = 'rollover_surplus',
  ROLLOVER_ALL = 'rollover_all',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum AlertLevel {
  NONE = 'none',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

// Core Entities
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string; // hashed
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number; // stored in cents to avoid floating point issues
  date: string; // ISO date string
  description: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  referenceId?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  period: BudgetPeriod;
  amount: number; // stored in cents
  rolloverRule: BudgetRolloverRule;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  alertAt80: boolean;
  alertAt100: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string; // 'user' | 'category' | 'expense' | 'budget'
  entityId: string;
  action: AuditAction;
  performedBy: string; // user id
  performedByName: string;
  performedByRole: UserRole;
  changes: AuditChange[];
  timestamp: string;
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

// Budget Status and Calculations
export interface BudgetStatus {
  budget: Budget;
  spent: number; // in cents
  remaining: number; // in cents
  percentageUsed: number;
  alertLevel: AlertLevel;
  categoryName: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalSpent: number; // all time, in cents
  monthlySpent: number; // current month, in cents
  topCategory: {
    name: string;
    amount: number; // in cents
    percentage: number;
  } | null;
  budgetStatus: {
    onTrack: number;
    warning: number;
    overBudget: number;
  };
  recentExpenses: Expense[];
}

// Chart Data
export interface CategoryBreakdownData {
  category: string;
  amount: number; // in cents
  percentage: number;
  color: string;
}

export interface MonthlyTrendData {
  month: string; // YYYY-MM
  amount: number; // in cents
}

export interface BudgetVsActualData {
  category: string;
  budgeted: number; // in cents
  actual: number; // in cents
  percentage: number;
}

// Filter and Query Types
export interface ExpenseFilters {
  userId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number; // in cents
  maxAmount?: number; // in cents
  paymentMethod?: PaymentMethod;
  search?: string;
}

export interface BudgetFilters {
  userId?: string;
  categoryId?: string;
  period?: BudgetPeriod;
  isActive?: boolean;
}

export interface AuditFilters {
  entityType?: string;
  action?: AuditAction;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogFilter extends AuditFilters {
  search?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  role?: UserRole; // only admin can set this
}

export interface AuthToken {
  token: string;
  user: Omit<User, 'password'>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Form Data Types
export interface ExpenseFormData {
  categoryId: string;
  amount: number; // in dollars, will be converted to cents
  date: string;
  description: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  referenceId?: string;
}

export interface BudgetFormData {
  categoryId: string;
  period: BudgetPeriod;
  amount: number; // in dollars, will be converted to cents
  rolloverRule: BudgetRolloverRule;
  startDate: string;
  endDate: string;
  alertAt80: boolean;
  alertAt100: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface UserFormData {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}

// Export Types
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  filters?: ExpenseFilters;
  includeCharts?: boolean;
  includeAudit?: boolean;
}

export interface ExportData {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  users: User[];
  summary: {
    totalExpenses: number;
    totalAmount: number;
    dateRange: { start: string; end: string };
  };
}

// Utility Types
export type SafeUser = Omit<User, 'password'>;

export interface DateRange {
  start: string;
  end: string;
}

export interface QuickDateRange {
  label: string;
  value: '7d' | '30d' | '90d' | 'this_month' | 'this_year' | 'custom';
  getRange: () => DateRange;
}
