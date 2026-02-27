-- run this once after creating the database
CREATE TABLE IF NOT EXISTS expense (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);
