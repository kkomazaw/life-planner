import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatYearMonth,
  formatYearMonthJa,
  getEndOfMonth,
  getStartOfMonth,
  isSameYearMonth,
} from './utils';

describe('formatCurrency', () => {
  it('should format positive numbers as Japanese currency', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1,000');
    expect(formatCurrency(1234567)).toContain('1,234,567');
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should format negative numbers correctly', () => {
    const result = formatCurrency(-5000);
    expect(result).toContain('5,000');
    expect(result).toContain('-');
  });

  it('should round decimal values', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,235');
  });
});

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should format zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatPercentage', () => {
  it('should format decimal as percentage with default 1 decimal place', () => {
    expect(formatPercentage(0.05)).toBe('5.0%');
    expect(formatPercentage(0.123)).toBe('12.3%');
  });

  it('should format with custom decimal places', () => {
    expect(formatPercentage(0.12345, 2)).toBe('12.35%');
    expect(formatPercentage(0.12345, 0)).toBe('12%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });
});

describe('formatYearMonth', () => {
  it('should format date as YYYY-MM', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    expect(formatYearMonth(date)).toBe('2024-01');
  });

  it('should pad single-digit months', () => {
    const date = new Date(2024, 8, 1); // September 1, 2024
    expect(formatYearMonth(date)).toBe('2024-09');
  });

  it('should handle December', () => {
    const date = new Date(2024, 11, 31); // December 31, 2024
    expect(formatYearMonth(date)).toBe('2024-12');
  });
});

describe('formatYearMonthJa', () => {
  it('should format date in Japanese format', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    expect(formatYearMonthJa(date)).toBe('2024年1月');
  });

  it('should not pad single-digit months', () => {
    const date = new Date(2024, 8, 1); // September 1, 2024
    expect(formatYearMonthJa(date)).toBe('2024年9月');
  });
});

describe('getEndOfMonth', () => {
  it('should return last day of month', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    const endOfMonth = getEndOfMonth(date);
    expect(endOfMonth.getDate()).toBe(31);
    expect(endOfMonth.getMonth()).toBe(0);
  });

  it('should handle February in leap year', () => {
    const date = new Date(2024, 1, 15); // February 15, 2024 (leap year)
    const endOfMonth = getEndOfMonth(date);
    expect(endOfMonth.getDate()).toBe(29);
  });

  it('should handle February in non-leap year', () => {
    const date = new Date(2023, 1, 15); // February 15, 2023
    const endOfMonth = getEndOfMonth(date);
    expect(endOfMonth.getDate()).toBe(28);
  });
});

describe('getStartOfMonth', () => {
  it('should return first day of month', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    const startOfMonth = getStartOfMonth(date);
    expect(startOfMonth.getDate()).toBe(1);
    expect(startOfMonth.getMonth()).toBe(0);
    expect(startOfMonth.getFullYear()).toBe(2024);
  });

  it('should work for any day in month', () => {
    const date = new Date(2024, 11, 31); // December 31, 2024
    const startOfMonth = getStartOfMonth(date);
    expect(startOfMonth.getDate()).toBe(1);
    expect(startOfMonth.getMonth()).toBe(11);
  });
});

describe('isSameYearMonth', () => {
  it('should return true for same year and month', () => {
    const date1 = new Date(2024, 0, 15);
    const date2 = new Date(2024, 0, 20);
    expect(isSameYearMonth(date1, date2)).toBe(true);
  });

  it('should return false for different months', () => {
    const date1 = new Date(2024, 0, 15);
    const date2 = new Date(2024, 1, 15);
    expect(isSameYearMonth(date1, date2)).toBe(false);
  });

  it('should return false for different years', () => {
    const date1 = new Date(2024, 0, 15);
    const date2 = new Date(2023, 0, 15);
    expect(isSameYearMonth(date1, date2)).toBe(false);
  });

  it('should return true for same date', () => {
    const date1 = new Date(2024, 0, 15);
    const date2 = new Date(2024, 0, 15);
    expect(isSameYearMonth(date1, date2)).toBe(true);
  });
});
