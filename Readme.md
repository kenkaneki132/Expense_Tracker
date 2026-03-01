# Expense Tracker App (Full Stack)

This workspace contains a React single-page application for tracking expenses (frontend) and a Node/Express backend with a PostgreSQL database.

```sql
CREATE TABLE expense (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);
```
## Running the backend

1. Install dependencies

   ```bash
   cd backend
   npm install
   # copy .env.example to .env and fill in your Postgres connection string
   # e.g. DATABASE_URL=postgres://user:pass@localhost:5432/expense_tracker
   ```

2. Create the database and run the initialization script:

   ```bash
   # using psql
   createdb expense_tracker
   psql expense_tracker -f init.sql
   ```

3. Start the server in development mode (with hot restart):

   ```bash
   npm run dev
   ```

   The API listens on the port configured by `PORT` in `.env` (default 3001).

You can test the endpoints with `curl` or a tool like Postman:

```bash
curl http://localhost:3001/expenses
curl -X POST -H "Content-Type: application/json" \
     -d '{"title":"Coffee","category":"Food","amount":3}' \
     http://localhost:3001/expenses
```
