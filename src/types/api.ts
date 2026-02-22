import {
  User,
  Category,
  Expense,
  Budget,
  AuditLog,
  SafeUser,
  BudgetStatus,
  DashboardStats
} from './models';

// API Route Handlers Response Types
export interface GetExpensesResponse {
  expenses: Expense[];
  total: number;
}

export interface GetBudgetsResponse {
  budgets: Budget[];
  total: number;
}

export interface GetBudgetStatusResponse {
  budgetStatuses: BudgetStatus[];
}

export interface GetDashboardStatsResponse {
  stats: DashboardStats;
}

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface GetUsersResponse {
  users: SafeUser[];
}

export interface GetAuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

// API Error Response
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
