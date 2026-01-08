export type ExpenseCategoryType = 'fixed' | 'variable' | 'other';
export type IncomeCategoryType = 'salary' | 'business' | 'investment' | 'other';

export interface ExpenseCategory {
  id: string;
  name: string;
  type: ExpenseCategoryType;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeCategory {
  id: string;
  name: string;
  type: IncomeCategoryType;
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
  categoryId: string;
  amount: number;
  memo?: string;
  linkedMemberId?: string; // 紐付けられた家族メンバーID（退職後は収入が停止）
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeWithCategory extends Income {
  category: IncomeCategory;
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
