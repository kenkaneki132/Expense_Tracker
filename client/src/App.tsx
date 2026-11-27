import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import type { Expense, NewExpense } from './types';
import { api, STORAGE_MODE } from './services/api';
import { summarize } from './lib/expenses';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseFilter from './components/ExpenseFilter';
import SummaryPanel from './components/SummaryPanel';
import Icon from './components/Icon';
import PortfolioBadge from './components/PortfolioBadge';

const SAMPLE: NewExpense[] = [
  { title: 'Groceries', description: 'Weekly shop', category: 'Food', amount: 86.4 },
  { title: 'Metro card', description: '', category: 'Transport', amount: 45 },
  { title: 'Electricity', description: 'November bill', category: 'Utilities', amount: 72.18 },
  { title: 'Concert tickets', description: '', category: 'Entertainment', amount: 120 },
  { title: 'Coffee', description: 'Oat latte', category: 'Food', amount: 5.25 },
];

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setExpenses(await api.fetchExpenses(filter || undefined));
      setError('');
    } catch (err) {
      setError(STORAGE_MODE === 'http'
        ? `Could not reach the API (${err instanceof Error ? err.message : 'network error'}). Is the backend running?`
        : 'Could not load saved expenses.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => summarize(expenses), [expenses]);

  const handleAdd = async (data: NewExpense) => {
    const created = await api.createExpense(data);
    if (!filter || filter === created.category) setExpenses(prev => [created, ...prev]);
  };

  const handleUpdate = async (id: number, data: NewExpense) => {
    const updated = await api.updateExpense(id, data);
    setExpenses(prev => prev.map(e => (e.id === id ? updated : e)).filter(e => !filter || e.category === filter));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const loadSample = async () => {
    for (const e of SAMPLE) await api.createExpense(e);
    await load();
  };

  const sampleButton = STORAGE_MODE === 'local' && !filter ? (
    <button className="btn btn-primary" onClick={loadSample}><Icon name="sparkles" size={16} /> Load sample data</button>
  ) : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark"><Icon name="receipt" size={22} /></span>
          <div>
            <h1 className="app-title">Expense tracker</h1>
            <p className="app-sub">Track spending by category and see where your money goes.</p>
          </div>
        </div>
        {STORAGE_MODE === 'local' && <span className="mode-badge" title="Data is stored in this browser only">Demo · saved in your browser</span>}
      </header>
      {error && (
        <div className="banner-error" role="alert">
          <span>{error}</span>
          <button className="btn btn-secondary" onClick={load}>Retry</button>
        </div>
      )}
      <SummaryPanel summary={summary} />
      <div className="layout">
        <div className="card card-pad form-card">
          <ExpenseForm onSubmit={handleAdd} />
        </div>
        <ExpenseList
          expenses={expenses}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          loading={loading}
          filtered={!!filter}
          tools={<ExpenseFilter value={filter} onChange={setFilter} />}
          emptyAction={sampleButton}
        />
      </div>
      <footer className="sm-badge-row"><PortfolioBadge /></footer>
    </div>
  );
}

export default App;
