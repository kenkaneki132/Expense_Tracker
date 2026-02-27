// import React from 'react';
interface Props {
  value: string;
  onChange: (category: string) => void;
}

const categories = ['', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];

export default function ExpenseFilter({ value, onChange }: Props) {
  return (
    <div className="expense-filter">
      <label>Filter by category:&nbsp;</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {categories.map(c => (
          <option key={c} value={c}>{c || 'All'}</option>
        ))}
      </select>
    </div>
  );
}
