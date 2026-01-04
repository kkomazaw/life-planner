import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { formatYearMonth } from '@/lib/utils';
import type { Expense } from '@/types/transaction';

interface ExpenseFormProps {
  expense?: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseForm({ expense, onClose, onSuccess }: ExpenseFormProps) {
  const { createExpense, updateExpense, expenseCategories } = useTransactions();
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!expense;

  useEffect(() => {
    if (expense) {
      setDate(formatYearMonth(expense.date));
      setCategoryId(expense.categoryId);
      setAmount(expense.amount.toString());
      setMemo(expense.memo || '');
    } else {
      const now = new Date();
      setDate(formatYearMonth(now));
      if (expenseCategories.length > 0) {
        setCategoryId(expenseCategories[0].id);
      }
    }
  }, [expense, expenseCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('年月を入力してください');
      return;
    }

    if (!categoryId) {
      setError('カテゴリを選択してください');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('正しい金額を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const [year, month] = date.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);

      if (isEdit && expense) {
        await updateExpense(expense.id, {
          date: monthDate,
          categoryId,
          amount: numAmount,
          memo: memo.trim() || undefined,
        });
      } else {
        await createExpense({
          date: monthDate,
          categoryId,
          amount: numAmount,
          memo: memo.trim() || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('保存に失敗しました');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? '支出を編集' : '支出を記録'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              年月 <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選択してください</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              金額 (円) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50000"
              min="0"
              step="1"
              required
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="メモを入力"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : isEdit ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
