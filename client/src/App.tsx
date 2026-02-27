import { useEffect, useState } from 'react';
import './App.css';
import type { Expense, NewExpense } from './types';
import * as api from './services/api';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseFilter from './components/ExpenseFilter';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try {
      const data = await api.fetchExpenses(filter || undefined);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleAdd = async (data: NewExpense) => {
    const created = await api.createExpense(data);
    setExpenses(prev => [created, ...prev]);
  };

  const handleUpdate = async (id: number, data: NewExpense) => {
    const updated = await api.updateExpense(id, data);
    setExpenses(prev => prev.map(e => (e.id === id ? updated : e)));
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this expense?')) {
      await api.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="app">
      <h1>Expense tracker</h1>
      <ExpenseForm onSubmit={handleAdd} />
      <ExpenseFilter value={filter} onChange={setFilter} />
      <ExpenseList
        expenses={expenses}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

export default App;
