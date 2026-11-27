// Storage layer. The routes only talk to this interface, so tests (and local dev without
// Postgres) can use the in-memory implementation.
//
// interface Repo {
//   list({ category? }): Promise<Expense[]>        newest first
//   create(data): Promise<Expense>
//   update(id, data): Promise<Expense | null>
//   remove(id): Promise<boolean>
//   summary(): Promise<{ total, count, byCategory: Record<string, number> }>
// }

const toExpense = (row) => ({ ...row, amount: Number(row.amount) }); // NUMERIC comes back as a string

export function createPgRepo(pool) {
  return {
    async list({ category } = {}) {
      const r = category
        ? await pool.query('SELECT * FROM expense WHERE category = $1 ORDER BY created_at DESC, id DESC', [category])
        : await pool.query('SELECT * FROM expense ORDER BY created_at DESC, id DESC');
      return r.rows.map(toExpense);
    },
    async create({ title, description, category, amount }) {
      const r = await pool.query(
        'INSERT INTO expense (title, description, category, amount) VALUES ($1,$2,$3,$4) RETURNING *',
        [title, description, category, amount],
      );
      return toExpense(r.rows[0]);
    },
    async update(id, { title, description, category, amount }) {
      const r = await pool.query(
        'UPDATE expense SET title=$1, description=$2, category=$3, amount=$4 WHERE id=$5 RETURNING *',
        [title, description, category, amount, id],
      );
      return r.rows[0] ? toExpense(r.rows[0]) : null;
    },
    async remove(id) {
      const r = await pool.query('DELETE FROM expense WHERE id=$1 RETURNING id', [id]);
      return r.rows.length > 0;
    },
    async summary() {
      const r = await pool.query('SELECT category, SUM(amount) AS total, COUNT(*) AS n FROM expense GROUP BY category');
      const byCategory = Object.fromEntries(r.rows.map((x) => [x.category, Number(x.total)]));
      const total = r.rows.reduce((a, x) => a + Number(x.total), 0);
      const count = r.rows.reduce((a, x) => a + Number(x.n), 0);
      return { total: Math.round(total * 100) / 100, count, byCategory };
    },
  };
}

export function createMemoryRepo(seed = []) {
  let rows = seed.map((e, i) => ({ id: i + 1, created_at: new Date().toISOString(), description: '', ...e }));
  let nextId = rows.length + 1;
  const newestFirst = (a, b) => (b.created_at === a.created_at ? b.id - a.id : b.created_at.localeCompare(a.created_at));
  return {
    async list({ category } = {}) {
      return rows.filter((r) => !category || r.category === category).sort(newestFirst).map((r) => ({ ...r }));
    },
    async create(data) {
      const row = { id: nextId++, created_at: new Date().toISOString(), ...data };
      rows.push(row);
      return { ...row };
    },
    async update(id, data) {
      const row = rows.find((r) => r.id === id);
      if (!row) return null;
      Object.assign(row, data);
      return { ...row };
    },
    async remove(id) {
      const before = rows.length;
      rows = rows.filter((r) => r.id !== id);
      return rows.length < before;
    },
    async summary() {
      const byCategory = {};
      for (const r of rows) byCategory[r.category] = Math.round(((byCategory[r.category] || 0) + r.amount) * 100) / 100;
      const total = Math.round(rows.reduce((a, r) => a + r.amount, 0) * 100) / 100;
      return { total, count: rows.length, byCategory };
    },
  };
}
