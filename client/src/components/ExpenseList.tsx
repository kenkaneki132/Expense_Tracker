import type { Expense, NewExpense } from '../types';
import ExpenseForm from './ExpenseForm';
import { useState } from 'react';

interface Props {
  expenses: Expense[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: NewExpense) => void;
}

type SortColumn = 'title' | 'description' | 'category' | 'amount' | 'created_at' | null;
type SortDirection = 'asc' | 'desc' | null;

export default function ExpenseList({ expenses, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    // Cycle: none -> asc -> desc -> none
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection('asc');
      return;
    }

    if (sortDirection === 'asc') {
      setSortDirection('desc');
      return;
    }

    // clear
    setSortColumn(null);
    setSortDirection(null);
  };

  const getSortedExpenses = () => {
    if (!sortColumn || !sortDirection) return expenses;

    const sorted = [...expenses].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const downloadCSV = () => {
    if (expenses.length === 0) {
      alert('No data available to download');
      return;
    }

    const hdrs = ['Title','Description','Category','Amount','Created Date'];
    const rows = expenses.map(e => [
      '"' + e.title.replace(/"/g,'""') + '"',
      '"' + (e.description||'').replace(/"/g,'""') + '"',
      '"' + e.category.replace(/"/g,'""') + '"',
      e.amount,
      new Date(e.created_at).toISOString(),
    ].join(','));
    const csv = [hdrs.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
    <div className="expense-table-wrapper">
      <div className="expense-table-container">
        <table className="expense-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
              Title{getSortIndicator('title')}
            </th>
            <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
              Description{getSortIndicator('description')}
            </th>
            <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
              Category{getSortIndicator('category')}
            </th>
            <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
              Amount{getSortIndicator('amount')}
            </th>
            <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
              Created Date{getSortIndicator('created_at')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {getSortedExpenses().map(e => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{e.description}</td>
              <td>{e.category}</td>
              <td>{e.amount}</td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
              <td>
                <button className="btn btn-edit" onClick={() => setEditingId(e.id)}>Edit</button>
                <button className="btn btn-delete" onClick={() => onDelete(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <button className="btn btn-submit" style={{ marginTop: '1rem' }} onClick={downloadCSV}>Download CSV</button>
    </div>
  );
}
