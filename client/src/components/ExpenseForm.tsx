import React, { useState } from 'react';
import type { Expense, NewExpense } from '../types';
import { CATEGORIES, validateExpense, type FieldErrors } from '../lib/expenses';
import Icon from './Icon';

interface Props {
  existing?: Expense;
  onSubmit: (data: NewExpense) => Promise<void> | void;
  onCancel?: () => void;
}

export default function ExpenseForm({ existing, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [category, setCategory] = useState<string>(existing?.category || CATEGORIES[0]);
  const [amount, setAmount] = useState(existing ? existing.amount.toFixed(2) : '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  // The add form and an edit form can be on screen together, so ids must not collide.
  const id = (f: string) => `${existing ? `edit-${existing.id}` : 'add'}-${f}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateExpense({ title, description, category, amount });
    if (!v.ok) { setErrors(v.errors); return; }
    setErrors({});
    setSubmitError('');
    setSaving(true);
    try {
      await onSubmit(v.value);
      if (!existing) { setTitle(''); setDescription(''); setAmount(''); }
    } catch (err) {
      const fieldErrors = (err as { fieldErrors?: FieldErrors }).fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length) setErrors(fieldErrors);
      setSubmitError(err instanceof Error ? err.message : 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  const err = (f: keyof FieldErrors) => errors[f] && (
    <p id={id(`${f}-err`)} className="field-error"><Icon name="alert" size={14} />{errors[f]}</p>
  );
  const describedBy = (f: keyof FieldErrors) => (errors[f] ? id(`${f}-err`) : undefined);

  return (
    <form onSubmit={handleSubmit} className="expense-form" noValidate>
      <div className="form-head">
        <h2 className="card-title">{existing ? `Edit “${existing.title}”` : 'Add an expense'}</h2>
      </div>
      {submitError && <p className="form-error" role="alert">{submitError}</p>}
      <div className="field">
        <label htmlFor={id('title')}>Title<span className="req" aria-hidden="true">*</span></label>
        <input id={id('title')} className="input" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={describedBy('title')} aria-required="true" placeholder="e.g. Groceries" />
        {err('title')}
      </div>
      <div className="field">
        <label htmlFor={id('amount')}>Amount<span className="req" aria-hidden="true">*</span></label>
        <div className="amount-wrap">
          <span aria-hidden="true">$</span>
          <input id={id('amount')} className="input" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} aria-invalid={!!errors.amount} aria-describedby={describedBy('amount')} aria-required="true" placeholder="12.50" />
        </div>
        {err('amount')}
      </div>
      <div className="field">
        <label htmlFor={id('category')}>Category</label>
        <select id={id('category')} className="input" value={category} onChange={e => setCategory(e.target.value)} aria-describedby={describedBy('category')}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {err('category')}
      </div>
      <div className="field">
        <label htmlFor={id('description')}>Description <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
        <textarea id={id('description')} className="input" value={description} onChange={e => setDescription(e.target.value)} aria-invalid={!!errors.description} aria-describedby={describedBy('description')} placeholder="A note for later" />
        {err('description')}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : existing ? <><Icon name="save" size={16} /> Update expense</> : <><Icon name="plus" size={16} /> Add expense</>}
        </button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}><Icon name="x" size={16} /> Cancel</button>}
      </div>
    </form>
  );
}
