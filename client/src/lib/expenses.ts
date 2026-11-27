// Pure helpers shared by the UI and the local storage backend (unit-tested in expenses.test.ts).
import type { Expense, NewExpense } from '../types';

export const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'] as const;
export const MAX_AMOUNT = 1_000_000;

export type FieldErrors = Partial<Record<'title' | 'description' | 'category' | 'amount', string>>;

/** Parses a user-typed amount. Returns null for '', '12abc', negatives, >2 decimals, etc. */
export function parseAmount(input: string | number): number | null {
  const s = String(input).trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  return n > 0 && n <= MAX_AMOUNT ? n : null;
}

export function validateExpense(input: { title: string; description?: string; category: string; amount: string | number }):
  { ok: true; value: NewExpense } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const title = input.title.trim();
  if (!title) errors.title = 'Title is required';
  else if (title.length > 100) errors.title = 'Title must be at most 100 characters';
  const description = (input.description ?? '').trim();
  if (description.length > 500) errors.description = 'Description must be at most 500 characters';
  if (!(CATEGORIES as readonly string[]).includes(input.category)) errors.category = 'Pick a category';
  const amount = parseAmount(input.amount);
  if (amount === null) errors.amount = 'Enter an amount greater than 0 with at most 2 decimals (e.g. 12.50)';
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { title, description, category: input.category, amount: amount as number } };
}

export const formatMoney = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

export interface Summary {
  total: number;
  count: number;
  byCategory: Record<string, number>;
  thisMonth: number;
  largest: Expense | null;
}

const cents = (n: number) => Math.round(n * 100) / 100;

export function summarize(expenses: Expense[], now = new Date()): Summary {
  const byCategory: Record<string, number> = {};
  let total = 0;
  let thisMonth = 0;
  let largest: Expense | null = null;
  for (const e of expenses) {
    total += e.amount;
    byCategory[e.category] = cents((byCategory[e.category] ?? 0) + e.amount);
    const d = new Date(e.created_at);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) thisMonth += e.amount;
    if (!largest || e.amount > largest.amount) largest = e;
  }
  return { total: cents(total), count: expenses.length, byCategory, thisMonth: cents(thisMonth), largest };
}

/** CSV with RFC 4180 quoting and protection against spreadsheet formula injection. */
export function toCSV(expenses: Expense[]): string {
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;          // stop Excel/Sheets from executing "=HYPERLINK(...)"
    return /[",\n\r]/.test(s) || s !== String(v ?? '') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = expenses.map((e) => [e.title, e.description ?? '', e.category, e.amount.toFixed(2), new Date(e.created_at).toISOString()].map(cell).join(','));
  return ['Title,Description,Category,Amount,Created Date', ...rows].join('\n');
}
