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
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">総資産額</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalAssets)}</p>
          <p className="text-sm opacity-75 mt-2">{assets.length}件の資産</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">今月の収入</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
          <p className="text-sm opacity-75 mt-2">{thisMonthIncomes.length}件</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">今月の支出</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalExpense)}</p>
          <p className="text-sm opacity-75 mt-2">{thisMonthExpenses.length}件</p>
        </div>

        <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-indigo-500 to-indigo-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow-lg p-6 text-white`}>
          <h3 className="text-sm font-medium opacity-90 mb-1">今月の収支</h3>
          <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
          <p className="text-sm opacity-75 mt-2">{balance >= 0 ? '黒字' : '赤字'}</p>
        </div>
      </div>

      {/* 資産構成 */}
      {assetComposition.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">資産構成</h2>
          <div className="space-y-4">
            {assetComposition.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                    <span className="text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/assets"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 mb-1">資産を管理</h3>
            <p className="text-sm text-gray-600">資産の追加や評価額の更新</p>
          </a>

          <a
            href="/transactions"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-2xl mb-2">💳</div>
            <h3 className="font-semibold text-gray-900 mb-1">収支を記録</h3>
            <p className="text-sm text-gray-600">収入・支出の記録</p>
          </a>

          <a
            href="/simulation"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-900 mb-1">シミュレーション</h3>
            <p className="text-sm text-gray-600">将来の資産推移を予測</p>
          </a>
        </div>
      </div>

      {/* データが空の場合のガイド */}
      {totalAssets === 0 && totalIncome === 0 && totalExpense === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Life Plannerへようこそ！
          </h2>
          <p className="text-blue-800 mb-6">
            まずは資産と収支を登録して、家計の管理を始めましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/assets"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              資産を登録する
            </a>
            <a
              href="/transactions"
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              収支を記録する
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
