export interface Expense {
  id: number;
  title: string;
  description?: string;
  category: string;
  amount: number;
}

export type NewExpense = Omit<Expense, 'id'>;
