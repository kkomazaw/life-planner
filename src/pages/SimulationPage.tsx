import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { runSimulation } from '@/lib/simulation';
import type { SimulationSettings, SimulationResult } from '@/types/simulation';

export function SimulationPage() {
  const { assets, assetHistory } = useAssets();
  const { incomes, expenses } = useTransactions();
  const { lifeEvents } = useLifeEvents();

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // デフォルトのシミュレーション設定
  const [settings] = useState<SimulationSettings>({
    id: uuidv4(),
    name: 'デフォルトシナリオ',
    expectedReturns: {
      cash: 0.001, // 0.1%
      investment: 0.05, // 5%
      property: 0.02, // 2%
      other: 0.01, // 1%
    },
    inflationRate: 0.02, // 2%
    futureIncome: [],
    futureExpense: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const handleRunSimulation = () => {
    setIsCalculating(true);
    try {
      const simulationResult = runSimulation({
        settings,
        currentAssets: assets,
        assetHistory,
        lifeEvents,
        incomes,
        expenses,
      });
      setResult(simulationResult);
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('シミュレーションに失敗しました');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">資産推移シミュレーション</h1>

      {/* 設定とシミュレーション実行 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">シミュレーション設定</h2>
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-blue-900 font-medium mb-2">現在の設定</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 現金・預金の運用利回り: {(settings.expectedReturns.cash * 100).toFixed(1)}%</li>
            <li>• 投資の運用利回り: {(settings.expectedReturns.investment * 100).toFixed(1)}%</li>
            <li>• 不動産の運用利回り: {(settings.expectedReturns.property * 100).toFixed(1)}%</li>
            <li>• その他の運用利回り: {(settings.expectedReturns.other * 100).toFixed(1)}%</li>
            <li>• インフレ率: {(settings.inflationRate * 100).toFixed(1)}%</li>
            <li>• シミュレーション期間: 30年（360ヶ月）</li>
          </ul>
        </div>
        <button
          onClick={handleRunSimulation}
          disabled={isCalculating}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? '計算中...' : 'シミュレーションを実行'}
        </button>
      </div>

      {/* 結果表示 */}
      {result && (
        <div className="space-y-6">
          {/* サマリー */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">シミュレーション結果サマリー</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">30年後の総資産</p>
                <p className="text-2xl font-bold">
                  ¥{Math.round(result.summary.finalAssetBalance).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">最大資産額</p>
                <p className="text-2xl font-bold">
                  ¥{Math.round(result.summary.maxAssetBalance).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">最小資産額</p>
                <p className="text-2xl font-bold">
                  ¥{Math.round(result.summary.minAssetBalance).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">総ライフイベント費用</p>
                <p className="text-2xl font-bold">
                  ¥{Math.round(result.summary.totalLifeEventCost).toLocaleString()}
                </p>
              </div>
            </div>

            {/* 警告 */}
            {result.summary.warningMonths.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-medium mb-2">⚠️ 警告</p>
                <p className="text-red-700 text-sm">
                  資産がマイナスになる月が{result.summary.warningMonths.length}ヶ月あります。
                  収支の見直しやライフイベントの調整を検討してください。
                </p>
              </div>
            )}
          </div>

          {/* 詳細データ（簡易表示） */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">年次推移</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      総資産額
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年間収入
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年間支出
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 31 }).map((_, yearIndex) => {
                    const monthIndex = yearIndex * 12;
                    const yearData = result.monthlyData.slice(monthIndex, monthIndex + 12);
                    if (yearData.length === 0) return null;

                    const yearEndAssets = yearData[yearData.length - 1]?.assetBalance || 0;
                    const yearIncome = yearData.reduce((sum, d) => sum + d.income, 0);
                    const yearExpense = yearData.reduce((sum, d) => sum + d.expense, 0);

                    return (
                      <tr key={yearIndex}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {yearIndex}年後
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          ¥{Math.round(yearEndAssets).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          ¥{Math.round(yearIncome).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          ¥{Math.round(yearExpense).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 初期状態のメッセージ */}
      {!result && !isCalculating && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-2">
            「シミュレーションを実行」ボタンをクリックして、将来の資産推移を予測しましょう
          </p>
          <p className="text-sm text-gray-500">
            現在の資産、収支、ライフイベントを基に30年分の予測を行います
          </p>
        </div>
      )}
    </div>
  );
}
