import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { useTransactionStore } from '@/store/transactionStore';
import type {
  Income,
  Expense,
  IncomeCategory,
  ExpenseCategory,
  IncomeCategoryType,
  ExpenseCategoryType,
} from '@/types/transaction';

export function useTransactions() {
  const store = useTransactionStore();

  // データベースから取得してストアに同期
  const incomes = useLiveQuery(() => db.incomes.toArray());
  const expenses = useLiveQuery(() => db.expenses.toArray());
  const incomeCategories = useLiveQuery(() => db.incomeCategories.orderBy('order').toArray());
  const expenseCategories = useLiveQuery(() => db.expenseCategories.orderBy('order').toArray());

  useEffect(() => {
    if (incomes) {
      store.setIncomes(incomes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes]);

  useEffect(() => {
    if (expenses) {
      store.setExpenses(expenses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  useEffect(() => {
    if (incomeCategories) {
      store.setIncomeCategories(incomeCategories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeCategories]);

  useEffect(() => {
    if (expenseCategories) {
      store.setExpenseCategories(expenseCategories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseCategories]);

  // 収入を作成
  const createIncome = async (data: { date: Date; categoryId: string; amount: number; memo?: string }) => {
    const now = new Date();
    const income: Income = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.incomes.add(income);
    return income;
  };

  // 収入を更新
  const updateIncome = async (id: string, updates: Partial<Omit<Income, 'id' | 'createdAt'>>) => {
    await db.incomes.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // 収入を削除
  const deleteIncome = async (id: string) => {
    await db.incomes.delete(id);
  };

  // 支出を作成
  const createExpense = async (data: {
    date: Date;
    categoryId: string;
    amount: number;
    memo?: string;
  }) => {
    const now = new Date();
    const expense: Expense = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.expenses.add(expense);
    return expense;
  };

  // 支出を更新
  const updateExpense = async (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    await db.expenses.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // 支出を削除
  const deleteExpense = async (id: string) => {
    await db.expenses.delete(id);
  };

  // 収入カテゴリを作成
  const createIncomeCategory = async (data: {
    name: string;
    type: IncomeCategoryType;
    order: number;
  }) => {
    const now = new Date();
    const category: IncomeCategory = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.incomeCategories.add(category);
    return category;
  };

  // 収入カテゴリを更新
  const updateIncomeCategory = async (
    id: string,
    updates: Partial<Omit<IncomeCategory, 'id' | 'createdAt'>>
  ) => {
    await db.incomeCategories.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // 収入カテゴリを削除
  const deleteIncomeCategory = async (id: string) => {
    await db.incomeCategories.delete(id);
  };

  // 支出カテゴリを作成
  const createExpenseCategory = async (data: {
    name: string;
    type: ExpenseCategoryType;
    order: number;
  }) => {
    const now = new Date();
    const category: ExpenseCategory = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.expenseCategories.add(category);
    return category;
  };

  // 支出カテゴリを更新
  const updateExpenseCategory = async (
    id: string,
    updates: Partial<Omit<ExpenseCategory, 'id' | 'createdAt'>>
  ) => {
    await db.expenseCategories.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // 支出カテゴリを削除
  const deleteExpenseCategory = async (id: string) => {
    await db.expenseCategories.delete(id);
  };

  return {
    incomes: store.incomes,
    expenses: store.expenses,
    incomeCategories: store.incomeCategories,
    expenseCategories: store.expenseCategories,
    createIncome,
    updateIncome,
    deleteIncome,
    createExpense,
    updateExpense,
    deleteExpense,
    createIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
  };
}
