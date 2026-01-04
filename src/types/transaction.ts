export type ExpenseCategoryType = 'fixed' | 'variable' | 'other';

export interface ExpenseCategory {
  id: string;
  name: string;
  type: ExpenseCategoryType;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  date: Date; // 年月
  categoryId: string;
  amount: number;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithCategory extends Expense {
  category: ExpenseCategory;
}

export interface Income {
  id: string;
  date: Date; // 年月
  source: string; // 収入源
  amount: number;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlySummary {
  date: Date; // 年月
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseByCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
  }[];
}
