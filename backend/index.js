import dotenv from 'dotenv';
import { createApp } from './app.js';
import { createMemoryRepo, createPgRepo } from './repository.js';

dotenv.config();
const PORT = process.env.PORT || 3001;

let repo;
if (process.env.DATABASE_URL) {
  const { default: pool } = await import('./db.js');
  repo = createPgRepo(pool);
} else {
  console.warn('DATABASE_URL not set: using an in-memory store (data resets on restart).');
  repo = createMemoryRepo([
    { title: 'Groceries', category: 'Food', amount: 64.2 },
    { title: 'Bus pass', category: 'Transport', amount: 45 },
    { title: 'Electricity bill', category: 'Utilities', amount: 88.5 },
  ]);
}

createApp(repo).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
