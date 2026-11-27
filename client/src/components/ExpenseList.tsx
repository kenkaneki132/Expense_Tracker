import type { ReactNode } from 'react';
import type { Expense, NewExpense } from '../types';
import { formatMoney, toCSV } from '../lib/expenses';
import { categoryColor } from '../lib/categoryColors';
import ExpenseForm from './ExpenseForm';
import Icon from './Icon';
import { useState } from 'react';

interface Props {
  expenses: Expense[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: NewExpense) => Promise<void>;
  /** Controls shown in the list header (filter etc.). */
  tools?: ReactNode;
  /** Shown in the empty state, e.g. a "load sample data" button. */
  emptyAction?: ReactNode;
  filtered?: boolean;
  loading?: boolean;
}

type SortColumn = 'title' | 'description' | 'category' | 'amount' | 'created_at' | null;
type SortDirection = 'asc' | 'desc' | null;

const COLUMNS: { key: Exclude<SortColumn, null>; label: string; num?: boolean }[] = [
  { key: 'title', label: 'Expense' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', num: true },
  { key: 'created_at', label: 'Date' },
];

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function ExpenseList({ expenses, onDelete, onUpdate, tools, emptyAction, filtered, loading }: Props) {
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

  const ariaSort = (column: SortColumn) =>
    sortColumn !== column || !sortDirection ? 'none' : sortDirection === 'asc' ? 'ascending' : 'descending';

  const downloadCSV = () => {
    if (expenses.length === 0) {
      alert('No data available to download');
      return;
    }

    const csv = toCSV(expenses);
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

  const editing = editingId !== null ? expenses.find(x => x.id === editingId) : undefined;

  return (
    <section className="card list-card" aria-label="Expenses">
      <div className="list-toolbar">
        <div>
          <h2 className="card-title">Expenses</h2>
          <p className="card-sub">{loading ? 'Loading…' : `${expenses.length} ${expenses.length === 1 ? 'entry' : 'entries'}${filtered ? ' in this category' : ''}`}</p>
        </div>
        <div className="list-tools">
          {tools}
          <button className="btn btn-secondary" onClick={downloadCSV} disabled={expenses.length === 0}>
            <Icon name="download" size={16} /> CSV
          </button>
        </div>
      </div>

      {editing ? (
        <div className="edit-panel">
          <ExpenseForm
            existing={editing}
            onSubmit={async data => {
              await onUpdate(editing.id, data);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      ) : loading ? (
        <p className="loading">Loading expenses…</p>
      ) : expenses.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Icon name="inbox" size={24} /></div>
          <h3>{filtered ? 'Nothing in this category yet' : 'No expenses yet'}</h3>
          <p>{filtered ? 'Pick another category or add an expense.' : 'Add your first expense with the form, or start from sample data.'}</p>
          {emptyAction}
        </div>
      ) : (
        <div className="expense-table-container">
          <table className="expense-table">
            <thead>
              <tr>
                {COLUMNS.map(c => (
                  <th key={c.key} className={c.num ? 'num' : undefined} aria-sort={ariaSort(c.key)} scope="col">
                    <button type="button" onClick={() => handleSort(c.key)}>
                      {c.label}
                      <span className="sort-icon">
                        <Icon name={sortColumn === c.key && sortDirection ? (sortDirection === 'asc' ? 'up' : 'down') : 'sort'} size={13} />
                      </span>
                    </button>
                  </th>
                ))}
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {getSortedExpenses().map(e => (
                <tr key={e.id}>
                  <td className="t-title">
                    <strong>{e.title}</strong>
                    {e.description && <span>{e.description}</span>}
                  </td>
                  <td className="t-cat">
                    <span className="chip"><i className="dot" style={{ background: categoryColor(e.category) }} />{e.category}</span>
                  </td>
                  <td className="amount">{formatMoney(e.amount)}</td>
                  <td className="date" title={new Date(e.created_at).toLocaleString()}>{shortDate(e.created_at)}</td>
                  <td className="row-actions">
                    <button className="icon-btn" onClick={() => setEditingId(e.id)} aria-label={`Edit ${e.title}`} title="Edit"><Icon name="pencil" size={16} /></button>
                    <button className="icon-btn danger" onClick={() => onDelete(e.id)} aria-label={`Delete ${e.title}`} title="Delete"><Icon name="trash" size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
