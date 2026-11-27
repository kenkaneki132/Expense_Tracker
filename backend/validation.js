// Input validation shared by the routes (pure functions, unit-tested in test/validation.test.js).

export const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];
export const MAX_AMOUNT = 1_000_000;

/**
 * Validates and normalizes an expense payload.
 * @returns {{ ok: true, value: {title, description, category, amount} } | { ok: false, errors: Record<string,string> }}
 */
export function validateExpense(body) {
  const errors = {};
  const b = body && typeof body === 'object' ? body : {};

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title) errors.title = 'Title is required';
  else if (title.length > 100) errors.title = 'Title must be at most 100 characters';

  const description = b.description == null ? '' : String(b.description).trim();
  if (description.length > 500) errors.description = 'Description must be at most 500 characters';

  const category = typeof b.category === 'string' ? b.category.trim() : '';
  if (!CATEGORIES.includes(category)) errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;

  // Accept numbers or numeric strings; reject '', '12abc', NaN, Infinity, negatives, >2 decimals.
  const raw = typeof b.amount === 'string' ? b.amount.trim() : b.amount;
  const amount = typeof raw === 'number' ? raw : raw !== '' && /^\d+(\.\d+)?$/.test(String(raw)) ? Number(raw) : NaN;
  if (!Number.isFinite(amount)) errors.amount = 'Amount must be a number';
  else if (amount <= 0) errors.amount = 'Amount must be greater than 0';
  else if (amount > MAX_AMOUNT) errors.amount = `Amount must be at most ${MAX_AMOUNT}`;
  else if (Math.abs(Math.round(amount * 100) - amount * 100) > 1e-6) {   // tolerance for float noise, e.g. 0.1 + 0.2
    errors.amount = 'Amount can have at most 2 decimal places';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { title, description, category, amount: Math.round(amount * 100) / 100 } };
}

/** Parses a route :id. Returns a positive integer or null. */
export function parseId(raw) {
  return /^[1-9]\d{0,9}$/.test(String(raw)) ? Number(raw) : null;
}
