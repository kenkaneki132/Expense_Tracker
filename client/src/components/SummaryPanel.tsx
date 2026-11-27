import type { Summary } from '../lib/expenses';
import { CATEGORIES, formatMoney } from '../lib/expenses';
import { categoryColor } from '../lib/categoryColors';

export default function SummaryPanel({ summary }: { summary: Summary }) {
  const rows = CATEGORIES
    .filter(c => summary.byCategory[c])
    .map(c => ({ category: c, amount: summary.byCategory[c] }))
    .sort((a, b) => b.amount - a.amount);
  const max = Math.max(1, ...rows.map(r => r.amount));
  const pct = (n: number) => (summary.total > 0 ? Math.round((n / summary.total) * 100) : 0);
  const monthName = new Date().toLocaleString('en-US', { month: 'long' });

  return (
    <section className="summary" aria-label="Spending summary">
      <div className="stats">
        <div className="card stat">
          <span className="stat-label">Total spent</span>
          <strong className="stat-value">{formatMoney(summary.total)}</strong>
          <span className="stat-note">across all categories</span>
        </div>
        <div className="card stat">
          <span className="stat-label">This month</span>
          <strong className="stat-value">{formatMoney(summary.thisMonth)}</strong>
          <span className="stat-note">{monthName}</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Expenses</span>
          <strong className="stat-value">{summary.count}</strong>
          <span className="stat-note">{summary.count === 1 ? 'entry' : 'entries'} recorded</span>
        </div>
        <div className="card stat">
          <span className="stat-label">Largest</span>
          <strong className="stat-value">{summary.largest ? formatMoney(summary.largest.amount) : '—'}</strong>
          <span className="stat-note" title={summary.largest?.title}>{summary.largest ? summary.largest.title : 'nothing yet'}</span>
        </div>
      </div>

      <div className="card card-pad">
        <h2 className="card-title">Spending by category</h2>
        <p className="card-sub">Largest first, with each category&apos;s share of the total.</p>
        {rows.length === 0 ? (
          <p className="summary-empty">Add an expense to see where your money goes.</p>
        ) : (
          <div className="cat-bars">
            {rows.map(r => (
              <div key={r.category} className="bar-row">
                <span className="bar-label"><i className="dot" style={{ background: categoryColor(r.category) }} />{r.category}</span>
                <span className="bar-track" aria-hidden="true">
                  <span className="bar-fill" style={{ width: `${(r.amount / max) * 100}%`, background: categoryColor(r.category) }} />
                </span>
                <span className="bar-value">{formatMoney(r.amount)}<small>{pct(r.amount)}%</small></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
