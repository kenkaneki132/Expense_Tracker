import React, { useEffect, useState } from 'react';
import type { Expense, NewExpense } from '../types';

interface Props {
  existing?: Expense;
  onSubmit: (data: NewExpense) => void;
  onCancel?: () => void;
}

const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];

export default function ExpenseForm({ existing, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [category, setCategory] = useState(existing?.category || categories[0]);
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [title, amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const n = parseInt(amount, 10);
    if (isNaN(n) || n < 0) {
      setError('Amount must be a positive integer');
      return;
    }
    onSubmit({ title, description, category, amount: n });
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      {error && <p className="error">{error}</p>}
      <div>
        <label>Title*</label>
        <input value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Amount*</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
      <button type="submit">{existing ? 'Update' : 'Add'} Expense</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}
