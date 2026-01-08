import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { useHousehold } from '@/hooks/useHousehold';
import { useSimulation } from '@/hooks/useSimulation';
import { runSimulation } from '@/lib/simulation';
import { formatCurrency } from '@/lib/utils';
import type { SimulationSettings, SimulationResult } from '@/types/simulation';

interface ContextMenuState {
  scenarioId: string;
  x: number;
  y: number;
}

const SCENARIO_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
];

export const ScenarioComparison = memo(function ScenarioComparison() {
  const { assets, assetHistory } = useAssets();
  const { incomes, expenses } = useTransactions();
  const { lifeEvents } = useLifeEvents();
  const { members: householdMembers } = useHousehold();
  const { scenarios, deleteScenario } = useSimulation();

  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 選択されたシナリオのシミュレーション結果を計算
  const simulationResults = useMemo(() => {
    if (selectedScenarioIds.length === 0) return [];

    return selectedScenarioIds
      .map((id) => {
        const scenario = scenarios.find((s) => s.id === id);
        if (!scenario) return null;

        const result = runSimulation({
          settings: scenario,
          currentAssets: assets,
          assetHistory,
          lifeEvents,
          incomes,
          expenses,
          householdMembers,
        });

        return {
          scenario,
          result,
        };
      })
      .filter((item): item is { scenario: SimulationSettings; result: SimulationResult } => item !== null);
  }, [selectedScenarioIds, scenarios, assets, assetHistory, lifeEvents, incomes, expenses, householdMembers]);

  // グラフデータの作成（年次集計）
  const chartData = useMemo(() => {
    if (simulationResults.length === 0) return [];

    const years = Array.from({ length: 31 }, (_, i) => i);

    return years.map((year) => {
      const dataPoint: any = {
        year: `${year}年後`,
        yearNum: year,
      };

      simulationResults.forEach(({ scenario, result }, index) => {
        const monthIndex = year * 12;
        const yearData = result.monthlyData.slice(monthIndex, monthIndex + 12);

        if (yearData.length > 0) {
          const yearEndAssets = yearData[yearData.length - 1]?.assetBalance || 0;
          dataPoint[scenario.name] = yearEndAssets;
        }
      });

      return dataPoint;
    });
  }, [simulationResults]);

  const toggleScenario = useCallback((scenarioId: string) => {
    setSelectedScenarioIds((prev) => {
      if (prev.includes(scenarioId)) {
        return prev.filter((id) => id !== scenarioId);
      } else {
        // 最大5つまで
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, scenarioId];
      }
    });
  }, []);

  // 右クリックメニューを開く
  const handleContextMenu = useCallback((e: React.MouseEvent, scenarioId: string) => {
    e.preventDefault();
    setContextMenu({
      scenarioId,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  // シナリオを削除
  const handleDeleteScenario = useCallback(async (scenarioId: string) => {
    if (confirm('このシナリオを削除してもよろしいですか？')) {
      try {
        await deleteScenario(scenarioId);
        // 選択リストからも削除
        setSelectedScenarioIds((prev) => prev.filter((id) => id !== scenarioId));
        setContextMenu(null);
      } catch (error) {
        console.error('Failed to delete scenario:', error);
        alert('シナリオの削除に失敗しました');
      }
    }
  }, [deleteScenario]);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  if (scenarios.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-600 mb-2">保存されたシナリオがありません</p>
        <p className="text-sm text-slate-500">
          シミュレーション画面でシナリオを保存してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* シナリオ選択 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          比較するシナリオを選択（最大5つ）
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((scenario, index) => {
            const isSelected = selectedScenarioIds.includes(scenario.id);
            const colorIndex = selectedScenarioIds.indexOf(scenario.id);
            const color = colorIndex >= 0 ? SCENARIO_COLORS[colorIndex] : '#cbd5e1';

            return (
              <button
                key={scenario.id}
                onClick={() => toggleScenario(scenario.id)}
                onContextMenu={(e) => handleContextMenu(e, scenario.id)}
                disabled={!isSelected && selectedScenarioIds.length >= 5}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-current bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  borderColor: isSelected ? color : undefined,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{scenario.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      現金: {(scenario.expectedReturns.cash * 100).toFixed(1)}% |
                      投資: {(scenario.expectedReturns.investment * 100).toFixed(1)}% |
                      インフレ: {(scenario.inflationRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  {isSelected && (
                    <div
                      className="w-4 h-4 rounded-full ml-2 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {selectedScenarioIds.length >= 5 && (
          <p className="text-sm text-amber-600 mt-3">
            最大5つまで選択できます。他のシナリオを選択するには、既存の選択を解除してください。
          </p>
        )}
      </div>

      {/* 比較グラフ */}
      {selectedScenarioIds.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">資産推移の比較</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: '#64748b' }}
                stroke="#cbd5e1"
                interval={2}
              />
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
              <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
              {simulationResults.map(({ scenario }, index) => (
                <Line
                  key={scenario.id}
                  type="monotone"
                  dataKey={scenario.name}
                  stroke={SCENARIO_COLORS[index]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* サマリー比較 */}
      {selectedScenarioIds.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">サマリー比較</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    シナリオ名
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    30年後の資産
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    最大資産額
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    最小資産額
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    警告月数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {simulationResults.map(({ scenario, result }, index) => (
                  <tr key={scenario.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: SCENARIO_COLORS[index] }}
                        />
                        <span className="text-sm font-medium text-slate-900">
                          {scenario.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900">
                      {formatCurrency(result.summary.finalAssetBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                      {formatCurrency(result.summary.maxAssetBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                      {formatCurrency(result.summary.minAssetBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {result.summary.warningMonths.length > 0 ? (
                        <span className="text-red-600 font-semibold">
                          {result.summary.warningMonths.length}ヶ月
                        </span>
                      ) : (
                        <span className="text-green-600">なし</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 説明 */}
      {selectedScenarioIds.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-slate-600 mb-2">シナリオを選択してください</p>
          <p className="text-sm text-slate-500">
            上部のシナリオカードをクリックして、比較するシナリオを選択できます
          </p>
        </div>
      )}

      {/* コンテキストメニュー */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={() => handleDeleteScenario(contextMenu.scenarioId)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            削除
          </button>
        </div>
      )}
    </div>
  );
});
