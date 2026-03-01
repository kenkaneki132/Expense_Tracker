export interface Expense {
  id: number;
  title: string;
  description?: string;
  category: string;
  amount: number;
  created_at: string;
}

export type NewExpense = Omit<Expense, 'id' | 'created_at'>;
