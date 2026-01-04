import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatYearMonthJa } from '@/lib/utils';
import type { Income, Expense } from '@/types/transaction';

interface IncomeExpenseChartProps {
  incomes: Income[];
  expenses: Expense[];
}

export function IncomeExpenseChart({ incomes, expenses }: IncomeExpenseChartProps) {
  // 月次データを集計
  const chartData = useMemo(() => {
    // すべての年月を取得
    const allMonths = new Set<string>();

    incomes.forEach((income) => {
      const key = `${income.date.getFullYear()}-${String(income.date.getMonth() + 1).padStart(2, '0')}`;
      allMonths.add(key);
    });

    expenses.forEach((expense) => {
      const key = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      allMonths.add(key);
    });

    // ソート
    const sortedMonths = Array.from(allMonths).sort();

    return sortedMonths.map((monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);
      const date = new Date(year, month - 1, 1);

      // その月の収入合計
      const monthIncome = incomes
        .filter((income) =>
          income.date.getFullYear() === year &&
          income.date.getMonth() === month - 1
        )
        .reduce((sum, income) => sum + income.amount, 0);

      // その月の支出合計
      const monthExpense = expenses
        .filter((expense) =>
          expense.date.getFullYear() === year &&
          expense.date.getMonth() === month - 1
        )
        .reduce((sum, expense) => sum + expense.amount, 0);

      // 収支
      const balance = monthIncome - monthExpense;

      return {
        date: formatYearMonthJa(date),
        収入: monthIncome,
        支出: monthExpense,
        収支: balance,
      };
    });
  }, [incomes, expenses]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
        <p className="text-gray-500">収支データがありません</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
          />
          <Tooltip
            formatter={(value) => `¥${Number(value || 0).toLocaleString()}`}
            labelStyle={{ color: '#1f2937' }}
          />
          <Legend />
          <Bar dataKey="収入" fill="#10b981" />
          <Bar dataKey="支出" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
