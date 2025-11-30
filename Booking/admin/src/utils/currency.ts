/**
 * Currency formatting utilities for Philippine Peso
 */

/**
 * Format a number as Philippine Peso (₱)
 * @param amount - The amount to format
 * @returns Formatted string like "₱500.00"
 */
export function formatPHP(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

/**
 * Format a number as Philippine Peso with thousands separator
 * @param amount - The amount to format
 * @returns Formatted string like "₱1,500.00"
 */
export function formatPHPWithSeparator(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format currency using Intl.NumberFormat (for backward compatibility)
 * Uses Philippine Peso
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}
