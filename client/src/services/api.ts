import type { Expense, NewExpense } from '../types';

export interface ExpenseApi {
  fetchExpenses(category?: string): Promise<Expense[]>;
  createExpense(expense: NewExpense): Promise<Expense>;
  updateExpense(id: number, expense: NewExpense): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function check(res: Response, fallback: string) {
  if (res.ok) return res;
  const body = await res.json().catch(() => ({}));
  throw new ApiError(body.error || fallback, res.status, body.errors || {});
}

const asExpense = (e: Expense): Expense => ({ ...e, amount: Number(e.amount) });

/** REST client for the Express backend. */
export function createHttpApi(baseUrl: string, fetchImpl: typeof fetch = (...a) => fetch(...a)): ExpenseApi {
  const json = (method: string, body: unknown) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return {
    async fetchExpenses(category) {
      const url = category ? `${baseUrl}/expenses?category=${encodeURIComponent(category)}` : `${baseUrl}/expenses`;
      return ((await (await check(await fetchImpl(url), 'Failed to fetch expenses')).json()) as Expense[]).map(asExpense);
    },
    async createExpense(expense) {
      return asExpense(await (await check(await fetchImpl(`${baseUrl}/expenses`, json('POST', expense)), 'Failed to create expense')).json());
    },
    async updateExpense(id, expense) {
      return asExpense(await (await check(await fetchImpl(`${baseUrl}/expenses/${id}`, json('PUT', expense)), 'Failed to update expense')).json());
    },
    async deleteExpense(id) {
      await check(await fetchImpl(`${baseUrl}/expenses/${id}`, { method: 'DELETE' }), 'Failed to delete expense');
    },
  };
}

type KV = Pick<Storage, 'getItem' | 'setItem'>;

/** Browser-only implementation backed by localStorage (used for the GitHub Pages demo). */
export function createLocalApi(storage: KV, key = 'expense-tracker:v1', now = () => new Date()): ExpenseApi {
  const read = (): Expense[] => {
    try { return JSON.parse(storage.getItem(key) || '[]'); } catch { return []; }
  };
  const write = (rows: Expense[]) => storage.setItem(key, JSON.stringify(rows));
  const newestFirst = (a: Expense, b: Expense) => (b.created_at === a.created_at ? b.id - a.id : b.created_at.localeCompare(a.created_at));
  return {
    async fetchExpenses(category) {
      return read().filter((e) => !category || e.category === category).sort(newestFirst);
    },
    async createExpense(expense) {
      const rows = read();
      const row: Expense = { ...expense, id: rows.reduce((m, e) => Math.max(m, e.id), 0) + 1, created_at: now().toISOString() };
      write([...rows, row]);
      return row;
    },
    async updateExpense(id, expense) {
      const rows = read();
      const i = rows.findIndex((e) => e.id === id);
      if (i < 0) throw new ApiError('Not found', 404);
      rows[i] = { ...rows[i], ...expense };
      write(rows);
      return rows[i];
    },
    async deleteExpense(id) {
      const rows = read();
      if (!rows.some((e) => e.id === id)) throw new ApiError('Not found', 404);
      write(rows.filter((e) => e.id !== id));
    },
  };
}

export const STORAGE_MODE = import.meta.env.VITE_STORAGE === 'local' ? 'local' : 'http';

function memoryStorage(): KV {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
}

function browserStorage(): KV {
  try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return localStorage; } catch { return memoryStorage(); }
}

export const api: ExpenseApi = STORAGE_MODE === 'local'
  ? createLocalApi(browserStorage())
  : createHttpApi(import.meta.env.VITE_API_URL || 'http://localhost:3001');
