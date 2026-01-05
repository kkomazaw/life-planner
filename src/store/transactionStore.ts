import { create } from 'zustand';
import type { Income, Expense, IncomeCategory, ExpenseCategory } from '@/types/transaction';

interface TransactionState {
  incomes: Income[];
  expenses: Expense[];
  incomeCategories: IncomeCategory[];
  expenseCategories: ExpenseCategory[];
  setIncomes: (incomes: Income[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setIncomeCategories: (categories: IncomeCategory[]) => void;
  setExpenseCategories: (categories: ExpenseCategory[]) => void;
  addIncome: (income: Income) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addIncomeCategory: (category: IncomeCategory) => void;
  updateIncomeCategory: (id: string, category: Partial<IncomeCategory>) => void;
  deleteIncomeCategory: (id: string) => void;
  addExpenseCategory: (category: ExpenseCategory) => void;
  updateExpenseCategory: (id: string, category: Partial<ExpenseCategory>) => void;
  deleteExpenseCategory: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  incomes: [],
  expenses: [],
  incomeCategories: [],
  expenseCategories: [],

  setIncomes: (incomes) => set({ incomes }),
  setExpenses: (expenses) => set({ expenses }),
  setIncomeCategories: (categories) => set({ incomeCategories: categories }),
  setExpenseCategories: (categories) => set({ expenseCategories: categories }),

  addIncome: (income) =>
    set((state) => ({
      incomes: [...state.incomes, income],
    })),

  updateIncome: (id, updates) =>
    set((state) => ({
      incomes: state.incomes.map((income) =>
        income.id === id ? { ...income, ...updates, updatedAt: new Date() } : income
      ),
    })),

  deleteIncome: (id) =>
    set((state) => ({
      incomes: state.incomes.filter((income) => income.id !== id),
    })),

  addExpense: (expense) =>
    set((state) => ({
      expenses: [...state.expenses, expense],
    })),

  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates, updatedAt: new Date() } : expense
      ),
    })),

  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    })),

  addIncomeCategory: (category) =>
    set((state) => ({
      incomeCategories: [...state.incomeCategories, category],
    })),

  updateIncomeCategory: (id, updates) =>
    set((state) => ({
      incomeCategories: state.incomeCategories.map((category) =>
        category.id === id ? { ...category, ...updates, updatedAt: new Date() } : category
      ),
    })),

  deleteIncomeCategory: (id) =>
    set((state) => ({
      incomeCategories: state.incomeCategories.filter((category) => category.id !== id),
    })),

  addExpenseCategory: (category) =>
    set((state) => ({
      expenseCategories: [...state.expenseCategories, category],
    })),

  updateExpenseCategory: (id, updates) =>
    set((state) => ({
      expenseCategories: state.expenseCategories.map((category) =>
        category.id === id ? { ...category, ...updates, updatedAt: new Date() } : category
      ),
    })),

  deleteExpenseCategory: (id) =>
    set((state) => ({
      expenseCategories: state.expenseCategories.filter((category) => category.id !== id),
    })),
}));
