import type { Expense } from '../types';
import ExpenseForm from './ExpenseForm';
import { useState } from 'react';

interface Props {
  expenses: Expense[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Omit<Expense, 'id'>) => void;
}

export default function ExpenseList({ expenses, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  if (editingId !== null) {
    const e = expenses.find(x => x.id === editingId);
    if (!e) return null;
    return (
      <ExpenseForm
        existing={e}
        onSubmit={data => {
          onUpdate(editingId, data);
          setEditingId(null);
        }}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map(e => (
          <tr key={e.id}>
            <td>{e.title}</td>
            <td>{e.description}</td>
            <td>{e.category}</td>
            <td>{e.amount}</td>
            <td>
              <button onClick={() => setEditingId(e.id)}>Edit</button>
              <button onClick={() => onDelete(e.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
