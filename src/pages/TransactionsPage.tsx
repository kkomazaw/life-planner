import { useState } from 'react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { IncomeForm } from '@/components/transactions/IncomeForm';
import { ExpenseForm } from '@/components/transactions/ExpenseForm';
import { formatYearMonth } from '@/lib/utils';
import type { Income, Expense } from '@/types/transaction';

export function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedMonthString, setSelectedMonthString] = useState(() => formatYearMonth(new Date()));
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>();
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMonthChange = (monthString: string) => {
    setSelectedMonthString(monthString);
    const [year, month] = monthString.split('-').map(Number);
    setSelectedMonth(new Date(year, month - 1, 1));
  };

  const handleAddIncome = () => {
    setEditingIncome(undefined);
    setShowIncomeForm(true);
  };

  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setShowExpenseForm(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setShowIncomeForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
    setSelectedMonthString(formatYearMonth(newDate));
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
    setSelectedMonthString(formatYearMonth(newDate));
  };

  const handleToday = () => {
    const now = new Date();
    setSelectedMonth(now);
    setSelectedMonthString(formatYearMonth(now));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">収支管理</h1>

        {/* 月選択とアクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              ←
            </button>
            <input
              type="month"
              value={selectedMonthString}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleNextMonth}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              →
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              今月
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddIncome}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              + 収入を追加
            </button>
            <button
              onClick={handleAddExpense}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              + 支出を追加
            </button>
          </div>
        </div>
      </div>

      <TransactionList
        key={refreshKey}
        selectedMonth={selectedMonth}
        onEditIncome={handleEditIncome}
        onEditExpense={handleEditExpense}
      />

      {showIncomeForm && (
        <IncomeForm
          income={editingIncome}
          onClose={() => setShowIncomeForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showExpenseForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => setShowExpenseForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
