/**
 * Currency utilities
 *
 * All amounts are stored in cents to avoid floating point precision issues.
 * These utilities convert between dollars and cents.
 */

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as currency string
 */
export function formatCurrency(
  cents: number,
  options: {
    symbol?: string;
    showSymbol?: boolean;
    showCents?: boolean;
  } = {}
): string {
  const {
    symbol = '$',
    showSymbol = true,
    showCents = true,
  } = options;

  const dollars = centsToDollars(cents);
  const formatted = showCents
    ? dollars.toFixed(2)
    : Math.round(dollars).toString();

  return showSymbol ? `${symbol}${formatted}` : formatted;
}

/**
 * Parse currency string to cents
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, '');
  const dollars = parseFloat(cleaned);

  if (isNaN(dollars)) {
    throw new Error('Invalid currency value');
  }

  return dollarsToCents(dollars);
}

/**
 * Validate amount (in cents)
 */
export function validateAmount(
  cents: number,
  options: {
    min?: number; // in cents
    max?: number; // in cents
  } = {}
): { isValid: boolean; error?: string } {
  const { min = 0, max = 99999999 } = options; // max ~$1M

  if (cents < min) {
    return {
      isValid: false,
      error: `Amount must be at least ${formatCurrency(min)}`,
    };
  }

  if (cents > max) {
    return {
      isValid: false,
      error: `Amount cannot exceed ${formatCurrency(max)}`,
    };
  }

  return { isValid: true };
}

/**
 * Format large numbers with K, M suffixes
 */
export function formatCompactCurrency(cents: number): string {
  const dollars = centsToDollars(cents);

  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  }

  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }

  return formatCurrency(cents);
}
