import { describe, expect, it, vi } from 'vitest';
import { createHttpApi, createLocalApi, ApiError } from './api';

function memory() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

describe('createLocalApi (GitHub Pages mode)', () => {
  it('supports full CRUD and persists to storage', async () => {
    const store = memory();
    let t = 0;
    const api = createLocalApi(store, 'k', () => new Date(Date.UTC(2026, 10, 1, 0, 0, t++)));
    const a = await api.createExpense({ title: 'A', description: '', category: 'Food', amount: 1.5 });
    const b = await api.createExpense({ title: 'B', description: '', category: 'Transport', amount: 2 });
    expect([a.id, b.id]).toEqual([1, 2]);
    expect((await api.fetchExpenses()).map((e) => e.title)).toEqual(['B', 'A']);           // newest first
    expect((await api.fetchExpenses('Food')).map((e) => e.title)).toEqual(['A']);
    expect((await api.updateExpense(1, { title: 'A2', description: 'x', category: 'Food', amount: 3 })).title).toBe('A2');
    await api.deleteExpense(2);
    expect((await api.fetchExpenses()).length).toBe(1);
    // a fresh instance over the same storage sees the data
    expect((await createLocalApi(store, 'k').fetchExpenses())[0].title).toBe('A2');
  });

  it('ids never collide after deletes', async () => {
    const api = createLocalApi(memory());
    await api.createExpense({ title: 'A', category: 'Food', amount: 1 });
    const b = await api.createExpense({ title: 'B', category: 'Food', amount: 1 });
    await api.deleteExpense(1);
    const c = await api.createExpense({ title: 'C', category: 'Food', amount: 1 });
    expect(c.id).toBeGreaterThan(b.id);
  });

  it('404s on unknown ids and survives corrupted storage', async () => {
    const store = memory();
    store.setItem('k', '{not json');
    const api = createLocalApi(store, 'k');
    expect(await api.fetchExpenses()).toEqual([]);
    await expect(api.deleteExpense(9)).rejects.toBeInstanceOf(ApiError);
    await expect(api.updateExpense(9, { title: 'x', category: 'Food', amount: 1 })).rejects.toMatchObject({ status: 404 });
  });
});

describe('createHttpApi', () => {
  it('converts NUMERIC strings from Postgres into numbers', async () => {
    const f = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify([{ id: 1, title: 'x', category: 'Food', amount: '12.50', created_at: '2026-01-01' }])));
    const api = createHttpApi('http://api', f as unknown as typeof fetch);
    expect((await api.fetchExpenses())[0].amount).toBe(12.5);
  });

  it('encodes the category filter', async () => {
    const f = vi.fn(async (_url: string, _init?: RequestInit) => new Response('[]'));
    await createHttpApi('http://api', f as unknown as typeof fetch).fetchExpenses('Food & Drink');
    expect(f.mock.calls[0][0]).toBe('http://api/expenses?category=Food%20%26%20Drink');
  });

  it('surfaces server field errors', async () => {
    const f = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({ error: 'Invalid input', errors: { amount: 'bad' } }), { status: 400 }));
    const err = await createHttpApi('http://api', f as unknown as typeof fetch).createExpense({ title: 'x', category: 'Food', amount: 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.fieldErrors).toEqual({ amount: 'bad' });
  });

  it('sends JSON for create/update and DELETE for remove', async () => {
    const f = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({ id: 3, title: 't', category: 'Food', amount: 1, created_at: '' })));
    const api = createHttpApi('http://api', f as unknown as typeof fetch);
    await api.updateExpense(3, { title: 't', category: 'Food', amount: 1 });
    await api.deleteExpense(3);
    expect(f.mock.calls[0][1]).toMatchObject({ method: 'PUT', headers: { 'Content-Type': 'application/json' } });
    expect(f.mock.calls[1]).toEqual(['http://api/expenses/3', { method: 'DELETE' }]);
  });
});
