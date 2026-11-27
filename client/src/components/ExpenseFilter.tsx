import { CATEGORIES } from '../lib/expenses';

interface Props {
  value: string;
  onChange: (category: string) => void;
}

const categories = ['', ...CATEGORIES];

export default function ExpenseFilter({ value, onChange }: Props) {
  return (
    <div className="expense-filter">
      <label htmlFor="filter">Category</label>
      <select id="filter" className="input" value={value} onChange={e => onChange(e.target.value)}>
        {categories.map(c => (
          <option key={c} value={c}>{c || 'All categories'}</option>
        ))}
      </select>
    </div>
  );
}
