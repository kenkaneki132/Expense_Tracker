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
   ```
2. Update Db String 
    ```
    in backend/.env file update user and pass with DB User Name and DB User Password
     e.g. DATABASE_URL=postgres://user:pass@localhost:5432/expense_tracker
    ```
3. Install Postgresql and create a user 
    https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
3. Create the database and run the initialization script:

   ```bash
   # using psql
   createdb expense_tracker
   psql expense_tracker -f init.sql
   ```

4. Start the server in development mode (with hot restart):

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
5. Install dependencies for the front end
   ```
   cd client
   npm install
   ```
6. run the front end
   ```
   npm run dev
   ```
   The application start on http://localhost:5173/
