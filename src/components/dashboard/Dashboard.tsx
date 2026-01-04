import { useMemo } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, isSameYearMonth } from '@/lib/utils';
import type { AssetType } from '@/types/asset';

const assetTypeLabels: Record<AssetType, string> = {
  cash: '現金・預金',
  investment: '投資',
  property: '不動産',
  other: 'その他',
};

export function Dashboard() {
  const { assets, assetHistory } = useAssets();
  const { incomes, expenses } = useTransactions();

  const currentMonth = useMemo(() => new Date(), []);

  // 総資産額の計算
  const totalAssets = useMemo(() => {
    return assets.reduce((total, asset) => {
      const history = assetHistory
        .filter((h) => h.assetId === asset.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      const latestValue = history[0]?.value || 0;
      return total + latestValue;
    }, 0);
  }, [assets, assetHistory]);

  // 資産種別ごとの合計
  const assetsByType = useMemo(() => {
    const byType: Record<AssetType, number> = {
      cash: 0,
      investment: 0,
      property: 0,
      other: 0,
    };

    assets.forEach((asset) => {
      const history = assetHistory
        .filter((h) => h.assetId === asset.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      const latestValue = history[0]?.value || 0;
      byType[asset.type] += latestValue;
    });

    return byType;
  }, [assets, assetHistory]);

  // 今月の収支
  const thisMonthIncomes = useMemo(() => {
    return incomes.filter((income) => isSameYearMonth(income.date, currentMonth));
  }, [incomes, currentMonth]);

  const thisMonthExpenses = useMemo(() => {
    return expenses.filter((expense) => isSameYearMonth(expense.date, currentMonth));
  }, [expenses, currentMonth]);

  const totalIncome = thisMonthIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpense;

  // 資産構成比の計算
  const assetComposition = useMemo(() => {
    if (totalAssets === 0) return [];

    return (Object.entries(assetsByType) as [AssetType, number][])
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        type,
        label: assetTypeLabels[type],
        value,
        percentage: (value / totalAssets) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [assetsByType, totalAssets]);

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">ダッシュボード</h1>
        <p className="text-sm text-slate-600 mt-1">資産と収支の概要</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            総資産額
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            {formatCurrency(totalAssets)}
          </div>
          <div className="text-xs text-slate-500 mt-2">{assets.length}件の資産</div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            今月の収入
          </div>
          <div className="text-2xl font-semibold text-emerald-600">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-xs text-slate-500 mt-2">{thisMonthIncomes.length}件</div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            今月の支出
          </div>
          <div className="text-2xl font-semibold text-rose-600">
            {formatCurrency(totalExpense)}
          </div>
          <div className="text-xs text-slate-500 mt-2">{thisMonthExpenses.length}件</div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            今月の収支
          </div>
          <div className={`text-2xl font-semibold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(balance)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {balance >= 0 ? '黒字' : '赤字'}
          </div>
        </div>
      </div>

      {/* 資産構成 */}
      {assetComposition.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">資産構成</h2>
          <div className="space-y-4">
            {assetComposition.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-slate-500 ml-2">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="/assets"
            className="flex flex-col p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
          >
            <h3 className="text-sm font-medium text-slate-900 mb-1">資産を管理</h3>
            <p className="text-xs text-slate-600">資産の追加や評価額の更新</p>
          </a>

          <a
            href="/transactions"
            className="flex flex-col p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
          >
            <h3 className="text-sm font-medium text-slate-900 mb-1">収支を記録</h3>
            <p className="text-xs text-slate-600">収入・支出の記録</p>
          </a>

          <a
            href="/simulation"
            className="flex flex-col p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
          >
            <h3 className="text-sm font-medium text-slate-900 mb-1">シミュレーション</h3>
            <p className="text-xs text-slate-600">将来の資産推移を予測</p>
          </a>
        </div>
      </div>

      {/* データが空の場合のガイド */}
      {totalAssets === 0 && totalIncome === 0 && totalExpense === 0 && (
        <div className="card p-12 text-center border-2 border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Life Plannerへようこそ
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            まずは資産と収支を登録して、家計の管理を始めましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/assets"
              className="btn-primary"
            >
              資産を登録する
            </a>
            <a
              href="/transactions"
              className="btn-secondary"
            >
              収支を記録する
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
