import type { Expense, NewExpense } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchExpenses(category?: string): Promise<Expense[]> {
  const url = category ? `${API_URL}/expenses?category=${encodeURIComponent(category)}` : `${API_URL}/expenses`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(expense: NewExpense): Promise<Expense> {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function updateExpense(id: number, expense: NewExpense): Promise<Expense> {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to update expense');
  return res.json();
}

export async function deleteExpense(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete expense');
}
