import { UserRole, PaymentMethod, BudgetPeriod, BudgetRolloverRule } from './models';

// Form validation error types
export interface FieldError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Form state
export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// Specific form field configurations
export interface SelectOption {
  label: string;
  value: string;
}

export const ROLE_OPTIONS: SelectOption[] = [
  { label: 'Admin', value: UserRole.ADMIN },
  { label: 'Accountant', value: UserRole.ACCOUNTANT },
  { label: 'Regular User', value: UserRole.USER },
];

export const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { label: 'Cash', value: PaymentMethod.CASH },
  { label: 'Credit Card', value: PaymentMethod.CREDIT_CARD },
  { label: 'Debit Card', value: PaymentMethod.DEBIT_CARD },
  { label: 'UPI', value: PaymentMethod.UPI },
  { label: 'Net Banking', value: PaymentMethod.NET_BANKING },
  { label: 'Other', value: PaymentMethod.OTHER },
];

export const BUDGET_PERIOD_OPTIONS: SelectOption[] = [
  { label: 'Monthly', value: BudgetPeriod.MONTHLY },
  { label: 'Annual', value: BudgetPeriod.ANNUAL },
];

export const ROLLOVER_RULE_OPTIONS: SelectOption[] = [
  { label: 'No Rollover', value: BudgetRolloverRule.NO_ROLLOVER },
  { label: 'Rollover Surplus Only', value: BudgetRolloverRule.ROLLOVER_SURPLUS },
  { label: 'Rollover All', value: BudgetRolloverRule.ROLLOVER_ALL },
];
