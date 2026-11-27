-- run this once after creating the database
CREATE TABLE IF NOT EXISTS expense (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),   -- NUMERIC keeps cents (INTEGER rounded 12.50 to 13)
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expense_category_idx ON expense (category);
CREATE INDEX IF NOT EXISTS expense_created_at_idx ON expense (created_at DESC);

-- Migrating an existing database created with the old INTEGER column:
-- ALTER TABLE expense ALTER COLUMN amount TYPE NUMERIC(12, 2);
