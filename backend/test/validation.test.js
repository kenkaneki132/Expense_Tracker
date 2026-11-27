import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateExpense, parseId, CATEGORIES } from '../validation.js';

const ok = { title: 'Lunch', category: 'Food', amount: 12.5 };

test('accepts a valid expense and normalizes it', () => {
  const r = validateExpense({ ...ok, title: '  Lunch  ', description: '  tacos ' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { title: 'Lunch', description: 'tacos', category: 'Food', amount: 12.5 });
});

test('keeps cents (regression: amount used to be an INTEGER column / parseInt)', () => {
  assert.equal(validateExpense({ ...ok, amount: '19.99' }).value.amount, 19.99);
  assert.equal(validateExpense({ ...ok, amount: 0.1 + 0.2 }).value.amount, 0.3);
});

for (const [amount, why] of [['', 'empty'], ['12abc', 'trailing junk'], [-5, 'negative'], [0, 'zero'],
  [NaN, 'NaN'], [Infinity, 'Infinity'], ['1e3', 'exponent string'], [1.234, '3 decimals'], [2_000_000, 'too large'], [null, 'null']]) {
  test(`rejects amount: ${why}`, () => {
    const r = validateExpense({ ...ok, amount });
    assert.equal(r.ok, false);
    assert.ok(r.errors.amount);
  });
}

test('requires a title and limits lengths', () => {
  assert.ok(validateExpense({ ...ok, title: '   ' }).errors.title);
  assert.ok(validateExpense({ ...ok, title: 'x'.repeat(101) }).errors.title);
  assert.ok(validateExpense({ ...ok, description: 'x'.repeat(501) }).errors.description);
});

test('category must be one of the known categories', () => {
  assert.ok(validateExpense({ ...ok, category: 'Crypto' }).errors.category);
  assert.ok(validateExpense({ ...ok, category: undefined }).errors.category);
  for (const c of CATEGORIES) assert.equal(validateExpense({ ...ok, category: c }).ok, true);
});

test('reports every invalid field at once', () => {
  const r = validateExpense({});
  assert.deepEqual(Object.keys(r.errors).sort(), ['amount', 'category', 'title']);
});

test('handles non-object bodies', () => {
  assert.equal(validateExpense(null).ok, false);
  assert.equal(validateExpense('x').ok, false);
});

test('parseId accepts positive integers only', () => {
  assert.equal(parseId('42'), 42);
  for (const bad of ['0', '-1', '1.5', 'abc', '', '01', '99999999999']) assert.equal(parseId(bad), null, bad);
});
