import { describe, expect, it } from 'vitest';
import { parseAmount, validateExpense, summarize, toCSV, formatMoney } from './expenses';
import type { Expense } from '../types';

const exp = (over: Partial<Expense>): Expense => ({ id: 1, title: 't', description: '', category: 'Food', amount: 1, created_at: '2026-11-10T12:00:00.000Z', ...over });

describe('parseAmount', () => {
  it.each([['12', 12], ['12.5', 12.5], ['19.99', 19.99], ['$1,250.00', 1250], [' 7 ', 7], [3.25, 3.25]])('parses %s', (input, out) => {
    expect(parseAmount(input)).toBe(out);
  });
  it.each(['', 'abc', '12abc', '-5', '0', '0.00', '1.234', '1e3', '2000000'])('rejects %s', (input) => {
    expect(parseAmount(input)).toBeNull();
  });
  it('keeps cents (regression: the old form used parseInt, so 12.50 became 12)', () => {
    expect(parseAmount('12.50')).toBe(12.5);
  });
});

describe('validateExpense', () => {
  it('trims and returns a NewExpense', () => {
    expect(validateExpense({ title: ' Tea ', description: ' green ', category: 'Food', amount: '3.10' }))
      .toEqual({ ok: true, value: { title: 'Tea', description: 'green', category: 'Food', amount: 3.1 } });
  });
  it('collects all field errors', () => {
    const r = validateExpense({ title: '', category: 'Nope', amount: 'x' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['amount', 'category', 'title']);
  });
});

describe('summarize', () => {
  const now = new Date('2026-11-26T12:00:00Z');
  const rows = [
    exp({ id: 1, amount: 10.1, category: 'Food', created_at: '2026-11-02T10:00:00Z' }),
    exp({ id: 2, amount: 0.2, category: 'Food', created_at: '2026-11-20T10:00:00Z' }),
    exp({ id: 3, amount: 50, category: 'Utilities', created_at: '2026-10-15T10:00:00Z' }),
  ];
  it('totals with cents intact (no 10.299999)', () => {
    const s = summarize(rows, now);
    expect(s.total).toBe(60.3);
    expect(s.byCategory).toEqual({ Food: 10.3, Utilities: 50 });
    expect(s.count).toBe(3);
  });
  it('computes this month and largest', () => {
    const s = summarize(rows, now);
    expect(s.thisMonth).toBe(10.3);
    expect(s.largest?.id).toBe(3);
  });
  it('handles an empty list', () => {
    expect(summarize([], now)).toEqual({ total: 0, count: 0, byCategory: {}, thisMonth: 0, largest: null });
  });
});

describe('toCSV', () => {
  it('quotes commas, quotes and newlines', () => {
    const csv = toCSV([exp({ title: 'Dinner, "fancy"', description: 'line1\nline2', amount: 42 })]);
    const [, row] = csv.split(/\n(?=")/);
    expect(row).toContain('"Dinner, ""fancy"""');
    expect(csv).toContain('42.00');
  });
  it('neutralizes spreadsheet formulas (CSV injection)', () => {
    const csv = toCSV([exp({ title: '=HYPERLINK("http://evil","x")' })]);
    expect(csv).toContain(`"'=HYPERLINK(""http://evil"",""x"")"`);
    expect(csv.split('\n')[1].startsWith('=')).toBe(false);
  });
  it('has a header row', () => {
    expect(toCSV([]).split('\n')[0]).toBe('Title,Description,Category,Amount,Created Date');
  });
});

describe('formatMoney', () => {
  it('formats USD', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
  });
});
