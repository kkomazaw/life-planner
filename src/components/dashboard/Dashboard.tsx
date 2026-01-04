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

const assetTypeColors: Record<AssetType, string> = {
  cash: 'bg-blue-500',
  investment: 'bg-green-500',
  property: 'bg-purple-500',
  other: 'bg-gray-500',
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
        color: assetTypeColors[type],
      }))
      .sort((a, b) => b.value - a.value);
  }, [assetsByType, totalAssets]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="page-header">ダッシュボード</h1>
        <p className="text-slate-600 mt-2">あなたの資産と収支を一目で確認</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover-lift group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                💰
              </div>
              <span className="badge badge-info text-xs">合計</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">総資産額</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(totalAssets)}
            </p>
            <p className="text-sm text-slate-500 mt-3">{assets.length}件の資産</p>
          </div>
        </div>

        <div className="card hover-lift group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                📈
              </div>
              <span className="badge badge-success text-xs">今月</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">収入</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-sm text-slate-500 mt-3">{thisMonthIncomes.length}件の収入</p>
          </div>
        </div>

        <div className="card hover-lift group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                📉
              </div>
              <span className="badge badge-warning text-xs">今月</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">支出</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              {formatCurrency(totalExpense)}
            </p>
            <p className="text-sm text-slate-500 mt-3">{thisMonthExpenses.length}件の支出</p>
          </div>
        </div>

        <div className={`card hover-lift group overflow-hidden relative ${balance >= 0 ? 'border-emerald-200' : 'border-orange-200'}`}>
          <div className={`absolute top-0 right-0 w-32 h-32 ${balance >= 0 ? 'bg-gradient-to-br from-emerald-500/10 to-blue-500/10' : 'bg-gradient-to-br from-orange-500/10 to-red-500/10'} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${balance >= 0 ? 'bg-gradient-to-br from-emerald-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-red-600'} flex items-center justify-center text-2xl shadow-lg`}>
                {balance >= 0 ? '✨' : '⚠️'}
              </div>
              <span className={`badge ${balance >= 0 ? 'badge-success' : 'badge-warning'} text-xs`}>
                {balance >= 0 ? '黒字' : '赤字'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">今月の収支</h3>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'bg-gradient-to-r from-emerald-600 to-blue-600' : 'bg-gradient-to-r from-orange-600 to-red-600'} bg-clip-text text-transparent`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-slate-500 mt-3">
              {balance >= 0 ? '順調です！' : '改善しましょう'}
            </p>
          </div>
        </div>
      </div>

      {/* 資産構成 */}
      {assetComposition.length > 0 && (
        <div className="card p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
              📊
            </div>
            <h2 className="text-2xl font-bold text-slate-900">資産構成</h2>
          </div>
          <div className="space-y-5">
            {assetComposition.map((item, index) => (
              <div key={item.type} className="group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${item.color.replace('bg-', 'bg-')} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                      {item.percentage.toFixed(0)}%
                    </div>
                    <span className="font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-lg">{formatCurrency(item.value)}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className={`${item.color} h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                    style={{ width: `${item.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="card p-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg">
            ⚡
          </div>
          <h2 className="text-2xl font-bold text-slate-900">クイックアクション</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/assets"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                💰
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">資産を管理</h3>
              <p className="text-sm text-slate-600">資産の追加や評価額の更新</p>
            </div>
          </a>

          <a
            href="/transactions"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">収支を記録</h3>
              <p className="text-sm text-slate-600">収入・支出の記録</p>
            </div>
          </a>

          <a
            href="/simulation"
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                📈
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">シミュレーション</h3>
              <p className="text-sm text-slate-600">将来の資産推移を予測</p>
            </div>
          </a>
        </div>
      </div>

      {/* データが空の場合のガイド */}
      {totalAssets === 0 && totalIncome === 0 && totalExpense === 0 && (
        <div className="card-glass p-12 text-center animate-scale-in border-2 border-indigo-200">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl">
            👋
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Life Plannerへようこそ！
          </h2>
          <p className="text-slate-600 mb-8 text-lg max-w-2xl mx-auto">
            まずは資産と収支を登録して、家計の管理を始めましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/assets"
              className="btn-gradient"
            >
              資産を登録する
            </a>
            <a
              href="/transactions"
              className="btn-gradient-accent"
            >
              収支を記録する
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
