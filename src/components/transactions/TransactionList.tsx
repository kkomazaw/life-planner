import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, formatYearMonthJa, isSameYearMonth } from '@/lib/utils';
import type { Income, Expense } from '@/types/transaction';

interface TransactionListProps {
  selectedMonth: Date;
  onEditIncome: (income: Income) => void;
  onEditExpense: (expense: Expense) => void;
}

export function TransactionList({ selectedMonth, onEditIncome, onEditExpense }: TransactionListProps) {
  const { incomes, expenses, expenseCategories, deleteIncome, deleteExpense } = useTransactions();

  // 選択された月の収入と支出をフィルタリング
  const monthIncomes = useMemo(() => {
    return incomes.filter((income) => isSameYearMonth(income.date, selectedMonth));
  }, [incomes, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((expense) => isSameYearMonth(expense.date, selectedMonth));
  }, [expenses, selectedMonth]);

  // 合計計算
  const totalIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpense;

  // カテゴリ別集計
  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<string, { name: string; amount: number }>();

    monthExpenses.forEach((expense) => {
      const category = expenseCategories.find((c) => c.id === expense.categoryId);
      if (category) {
        const existing = categoryMap.get(category.id);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          categoryMap.set(category.id, { name: category.name, amount: expense.amount });
        }
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, expenseCategories]);

  const handleDeleteIncome = async (id: string) => {
    if (confirm('この収入を削除してもよろしいですか？')) {
      await deleteIncome(id);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('この支出を削除してもよろしいですか？')) {
      await deleteExpense(id);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return expenseCategories.find((c) => c.id === categoryId)?.name || '不明';
  };

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-1">収入</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">{monthIncomes.length}件</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-1">支出</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          <p className="text-xs text-gray-500 mt-1">{monthExpenses.length}件</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-1">収支</h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {balance >= 0 ? '黒字' : '赤字'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 収入一覧 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            収入 ({formatYearMonthJa(selectedMonth)})
          </h3>
          {monthIncomes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">収入が記録されていません</p>
          ) : (
            <div className="space-y-3">
              {monthIncomes.map((income) => (
                <div key={income.id} className="flex items-start justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{income.source}</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(income.amount)}</p>
                    {income.memo && <p className="text-sm text-gray-600 mt-1">{income.memo}</p>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEditIncome(income)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteIncome(income.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 支出一覧 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            支出 ({formatYearMonthJa(selectedMonth)})
          </h3>
          {monthExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">支出が記録されていません</p>
          ) : (
            <div className="space-y-3">
              {monthExpenses.map((expense) => (
                <div key={expense.id} className="flex items-start justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{getCategoryName(expense.categoryId)}</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                    {expense.memo && <p className="text-sm text-gray-600 mt-1">{expense.memo}</p>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* カテゴリ別支出 */}
      {expenseByCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別支出</h3>
          <div className="space-y-2">
            {expenseByCategory.map((item, index) => {
              const percentage = (item.amount / totalExpense) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
