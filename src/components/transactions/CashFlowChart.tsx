import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';

export function CashFlowChart() {
  const { incomes, expenses } = useTransactions();

  // 月ごとのキャッシュフローデータを作成
  const chartData = useMemo(() => {
    // 全ての年月を取得
    const allDates = new Set<string>();
    incomes.forEach((income) => {
      allDates.add(income.date.toISOString().slice(0, 7));
    });
    expenses.forEach((expense) => {
      allDates.add(expense.date.toISOString().slice(0, 7));
    });

    // ソート
    const sortedDates = Array.from(allDates).sort();

    // 各月のデータを集計
    return sortedDates.map((monthStr) => {
      const monthIncomes = incomes.filter(
        (income) => income.date.toISOString().slice(0, 7) === monthStr
      );
      const monthExpenses = expenses.filter(
        (expense) => expense.date.toISOString().slice(0, 7) === monthStr
      );

      const totalIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0);
      const totalExpense = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const balance = totalIncome - totalExpense;

      return {
        month: monthStr,
        monthLabel: new Date(monthStr + '-01').toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
        }),
        income: totalIncome,
        expense: totalExpense,
        balance,
      };
    });
  }, [incomes, expenses]);

  if (chartData.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500">データがありません</p>
        <p className="text-sm text-slate-400 mt-2">
          収入・支出を記録すると、ここに推移グラフが表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">キャッシュフロー推移</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            stroke="#cbd5e1"
            tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="income" fill="#10b981" name="収入" />
          <Bar dataKey="expense" fill="#ef4444" name="支出" />
          <Bar dataKey="balance" fill="#3b82f6" name="収支" />
        </BarChart>
      </ResponsiveContainer>

      {/* サマリー */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <div className="text-xs text-emerald-700 font-medium mb-1">平均収入</div>
          <div className="text-lg font-bold text-emerald-600">
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.income, 0) / chartData.length
            )}
          </div>
        </div>
        <div className="text-center p-3 bg-rose-50 rounded-lg">
          <div className="text-xs text-rose-700 font-medium mb-1">平均支出</div>
          <div className="text-lg font-bold text-rose-600">
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.expense, 0) / chartData.length
            )}
          </div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-700 font-medium mb-1">平均収支</div>
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(
              chartData.reduce((sum, d) => sum + d.balance, 0) / chartData.length
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
