import express from 'express';
import { CATEGORIES, parseId, validateExpense } from '../validation.js';

// Wrap async handlers so unexpected errors become a 500 instead of an unhandled rejection.
const handle = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

export default function expenseRouter(repo) {
  const router = express.Router();

  // GET /expenses?category=...
  router.get('/', handle(async (req, res) => {
    const { category } = req.query;
    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category', errors: { category: `Must be one of: ${CATEGORIES.join(', ')}` } });
    }
    res.json(await repo.list({ category: category || undefined }));
  }));

  // GET /expenses/summary → { total, count, byCategory }
  router.get('/summary', handle(async (_req, res) => {
    res.json(await repo.summary());
  }));

  // POST /expenses
  router.post('/', handle(async (req, res) => {
    const v = validateExpense(req.body);
    if (!v.ok) return res.status(400).json({ error: 'Invalid input', errors: v.errors });
    res.status(201).json(await repo.create(v.value));
  }));

  // PUT /expenses/:id
  router.put('/:id', handle(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id' });
    const v = validateExpense(req.body);
    if (!v.ok) return res.status(400).json({ error: 'Invalid input', errors: v.errors });
    const updated = await repo.update(id, v.value);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  }));

  // DELETE /expenses/:id
  router.delete('/:id', handle(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id' });
    if (!(await repo.remove(id))) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  }));

  return router;
}
