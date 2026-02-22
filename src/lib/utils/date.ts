import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  isValid,
} from 'date-fns';
import { DateRange, QuickDateRange } from '@/types/models';

/**
 * Date formatting utilities
 */

/**
 * Format date to display string
 */
export function formatDate(
  dateStr: string,
  formatStr: string = 'MMM dd, yyyy'
): string {
  const date = new Date(dateStr);
  return isValid(date) ? format(date, formatStr) : 'Invalid Date';
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatInputDate(dateStr: string): string {
  const date = new Date(dateStr);
  return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
}

/**
 * Format datetime to display string
 */
export function formatDateTime(
  dateStr: string,
  formatStr: string = 'MMM dd, yyyy hh:mm a'
): string {
  const date = new Date(dateStr);
  return isValid(date) ? format(date, formatStr) : 'Invalid Date';
}

/**
 * Get current date as ISO string
 */
export function getCurrentDate(): string {
  return new Date().toISOString();
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayInputDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Parse input date (YYYY-MM-DD) to ISO string
 */
export function parseInputDate(inputDate: string): string {
  const date = parse(inputDate, 'yyyy-MM-dd', new Date());
  return date.toISOString();
}

/**
 * Get month name from date string
 */
export function getMonthName(dateStr: string): string {
  return formatDate(dateStr, 'MMMM yyyy');
}

/**
 * Get month/year from date string (YYYY-MM)
 */
export function getMonthYear(dateStr: string): string {
  return formatDate(dateStr, 'yyyy-MM');
}

/**
 * Quick date range helpers
 */
export const QuickDateRanges: QuickDateRange[] = [
  {
    label: 'Last 7 Days',
    value: '7d',
    getRange: () => {
      const end = new Date();
      const start = subDays(end, 7);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    },
  },
  {
    label: 'Last 30 Days',
    value: '30d',
    getRange: () => {
      const end = new Date();
      const start = subDays(end, 30);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    },
  },
  {
    label: 'Last 90 Days',
    value: '90d',
    getRange: () => {
      const end = new Date();
      const start = subDays(end, 90);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    },
  },
  {
    label: 'This Month',
    value: 'this_month',
    getRange: () => {
      const now = new Date();
      return {
        start: startOfMonth(now).toISOString(),
        end: endOfMonth(now).toISOString(),
      };
    },
  },
  {
    label: 'This Year',
    value: 'this_year',
    getRange: () => {
      const now = new Date();
      return {
        start: startOfYear(now).toISOString(),
        end: endOfYear(now).toISOString(),
      };
    },
  },
  {
    label: 'Custom Range',
    value: 'custom',
    getRange: () => {
      // Will be overridden by custom selection
      return {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      };
    },
  },
];

/**
 * Get date range by quick range value
 */
export function getQuickDateRange(
  value: QuickDateRange['value']
): DateRange {
  const range = QuickDateRanges.find((r) => r.value === value);
  return range ? range.getRange() : QuickDateRanges[0].getRange();
}

/**
 * Check if date is within range
 */
export function isDateInRange(
  dateStr: string,
  range: DateRange
): boolean {
  const date = new Date(dateStr);
  const start = new Date(range.start);
  const end = new Date(range.end);

  return date >= start && date <= end;
}

/**
 * Validate date string
 */
export function validateDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return isValid(date);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateStr);
  }
}
