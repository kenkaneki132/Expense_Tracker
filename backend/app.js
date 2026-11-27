import express from 'express';
import cors from 'cors';
import expenseRouter from './routes/expenses.js';
import { CATEGORIES } from './validation.js';

/** Builds the Express app around a repository (see repository.js). Exported for tests. */
export function createApp(repo, { corsOrigin = process.env.CORS_ORIGIN || '*' } = {}) {
  const app = express();
  app.use(cors({ origin: corsOrigin === '*' ? '*' : corsOrigin.split(',') }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/', (_req, res) => res.send('Expense tracker API'));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/categories', (_req, res) => res.json(CATEGORIES));
  app.use('/expenses', expenseRouter(repo));

  // Malformed JSON bodies → 400 instead of an HTML stack trace.
  app.use((err, _req, res, next) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
    return next(err);
  });
  return app;
}
