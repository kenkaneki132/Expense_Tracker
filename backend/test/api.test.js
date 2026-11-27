// HTTP-level tests against the real Express app with the in-memory repository.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { createMemoryRepo } from '../repository.js';

let server, base, repo;

beforeEach(() => {
  repo = createMemoryRepo();
  server?.close();
  server = createApp(repo).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server?.close());

const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const post = (body) => fetch(`${base}/expenses`, json('POST', body));

test('health and categories', async () => {
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' });
  assert.ok((await (await fetch(`${base}/categories`)).json()).includes('Food'));
});

test('create → list → update → delete round trip', async () => {
  const created = await (await post({ title: 'Coffee', category: 'Food', amount: 4.75 })).json();
  assert.equal(created.amount, 4.75);
  assert.ok(created.id && created.created_at);

  let list = await (await fetch(`${base}/expenses`)).json();
  assert.equal(list.length, 1);

  const upd = await fetch(`${base}/expenses/${created.id}`, json('PUT', { title: 'Latte', category: 'Food', amount: 5.25 }));
  assert.equal(upd.status, 200);
  assert.equal((await upd.json()).title, 'Latte');

  assert.equal((await fetch(`${base}/expenses/${created.id}`, { method: 'DELETE' })).status, 200);
  list = await (await fetch(`${base}/expenses`)).json();
  assert.equal(list.length, 0);
});

test('POST returns 201 and field errors on bad input', async () => {
  assert.equal((await post({ title: 'Ok', category: 'Food', amount: 1 })).status, 201);
  const bad = await post({ title: '', category: 'Nope', amount: -1 });
  assert.equal(bad.status, 400);
  assert.deepEqual(Object.keys((await bad.json()).errors).sort(), ['amount', 'category', 'title']);
});

test('malformed JSON is a 400, not a stack trace', async () => {
  const r = await fetch(`${base}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, 'Malformed JSON');
});

test('invalid and unknown ids', async () => {
  assert.equal((await fetch(`${base}/expenses/abc`, { method: 'DELETE' })).status, 400);
  assert.equal((await fetch(`${base}/expenses/999`, { method: 'DELETE' })).status, 404);
  assert.equal((await fetch(`${base}/expenses/999`, json('PUT', { title: 'x', category: 'Food', amount: 1 }))).status, 404);
});

test('category filter and validation', async () => {
  await post({ title: 'Bus', category: 'Transport', amount: 2.5 });
  await post({ title: 'Pizza', category: 'Food', amount: 18 });
  const food = await (await fetch(`${base}/expenses?category=Food`)).json();
  assert.deepEqual(food.map((e) => e.title), ['Pizza']);
  assert.equal((await fetch(`${base}/expenses?category=Crypto`)).status, 400);
});

test('list is newest first', async () => {
  for (const t of ['a', 'b', 'c']) await post({ title: t, category: 'Other', amount: 1 });
  const titles = (await (await fetch(`${base}/expenses`)).json()).map((e) => e.title);
  assert.deepEqual(titles, ['c', 'b', 'a']);
});

test('summary totals by category with cents intact', async () => {
  await post({ title: 'a', category: 'Food', amount: 10.1 });
  await post({ title: 'b', category: 'Food', amount: 0.2 });
  await post({ title: 'c', category: 'Utilities', amount: 50 });
  const s = await (await fetch(`${base}/expenses/summary`)).json();
  assert.deepEqual(s, { total: 60.3, count: 3, byCategory: { Food: 10.3, Utilities: 50 } });
});

test('repository errors become a clean 500', async () => {
  repo.list = async () => { throw new Error('db down'); };
  const r = await fetch(`${base}/expenses`);
  assert.equal(r.status, 500);
  assert.deepEqual(await r.json(), { error: 'Internal server error' });
});
