import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenses.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.send('Expense tracker API');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});