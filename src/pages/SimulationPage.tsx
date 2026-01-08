import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from 'recharts';
import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { useSimulation } from '@/hooks/useSimulation';
import { useHousehold } from '@/hooks/useHousehold';
import { runSimulation } from '@/lib/simulation';
import { HelpTooltip } from '@/components/ui/Tooltip';
import { ScenarioComparison } from '@/components/simulation/ScenarioComparison';
import { formatCurrency } from '@/lib/utils';
import type { SimulationSettings, SimulationResult } from '@/types/simulation';

export function SimulationPage() {
  const { assets, assetHistory } = useAssets();
  const { incomes, expenses } = useTransactions();
  const { lifeEvents } = useLifeEvents();
  const { members: householdMembers } = useHousehold();
  const { scenarios, createScenario } = useSimulation();

  const [activeTab, setActiveTab] = useState<'simulation' | 'comparison'>('simulation');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // シミュレーション設定（編集可能）
  const [settings, setSettings] = useState<SimulationSettings>({
    id: uuidv4(),
    name: 'デフォルトシナリオ',
    expectedReturns: {
      cash: 0.001, // 0.1%
      investment: 0.05, // 5%
      property: 0.02, // 2%
      insurance: 0.01, // 1%
      other: 0.01, // 1%
    },
    inflationRate: 0.02, // 2%
    futureIncome: [],
    futureExpense: [],
    withdrawal: {
      enabled: false,
      startDate: new Date(),
      monthlyAmount: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 運用利回りの更新
  const updateExpectedReturn = (assetType: keyof typeof settings.expectedReturns, value: number) => {
    setSettings({
      ...settings,
      expectedReturns: {
        ...settings.expectedReturns,
        [assetType]: value / 100, // パーセント表記から小数に変換
      },
      updatedAt: new Date(),
    });
  };

  // インフレ率の更新
  const updateInflationRate = (value: number) => {
    setSettings({
      ...settings,
      inflationRate: value / 100,
      updatedAt: new Date(),
    });
  };

  // シナリオ名の更新
  const updateScenarioName = (name: string) => {
    setSettings({
      ...settings,
      name,
      updatedAt: new Date(),
    });
  };

  // プリセットシナリオ
  const loadPreset = (preset: 'optimistic' | 'standard' | 'pessimistic') => {
    const presets = {
      optimistic: {
        name: '楽観的シナリオ',
        expectedReturns: {
          cash: 0.002,
          investment: 0.07,
          property: 0.03,
          insurance: 0.02,
          other: 0.02,
        },
        inflationRate: 0.015,
      },
      standard: {
        name: '標準シナリオ',
        expectedReturns: {
          cash: 0.001,
          investment: 0.05,
          property: 0.02,
          insurance: 0.01,
          other: 0.01,
        },
        inflationRate: 0.02,
      },
      pessimistic: {
        name: '悲観的シナリオ',
        expectedReturns: {
          cash: 0.0005,
          investment: 0.03,
          property: 0.01,
          insurance: 0.005,
          other: 0.005,
        },
        inflationRate: 0.025,
      },
    };

    setSettings({
      ...settings,
      ...presets[preset],
      id: uuidv4(),
      withdrawal: settings.withdrawal, // 取り崩し設定は保持
      updatedAt: new Date(),
    });
  };

  // 保存されたシナリオを読み込む
  const loadSavedScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setSettings({
        ...scenario,
        updatedAt: new Date(),
      });
    }
  };

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
        householdMembers,
      });
      setResult(simulationResult);
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('シミュレーションに失敗しました');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveScenario = async () => {
    setIsSaving(true);
    try {
      await createScenario({
        name: settings.name,
        expectedReturns: settings.expectedReturns,
        inflationRate: settings.inflationRate,
        futureIncome: settings.futureIncome,
        futureExpense: settings.futureExpense,
        withdrawal: settings.withdrawal,
      });
      alert(`シナリオ「${settings.name}」を保存しました`);
      // 新しいシナリオIDを生成
      setSettings({
        ...settings,
        id: uuidv4(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save scenario:', error);
      alert('シナリオの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // グラフデータの作成（年次集計、資産種別の内訳付き）
  const chartData = useMemo(() => {
    if (!result) return [];

    return Array.from({ length: 30 }).map((_, yearIndex) => {
      const monthIndex = yearIndex * 12;
      const yearData = result.monthlyData.slice(monthIndex, monthIndex + 12);

      if (yearData.length === 0) {
        return {
          year: `${yearIndex}年後`,
          現金: 0,
          投資: 0,
          不動産: 0,
          その他: 0,
        };
      }

      const yearEndData = yearData[yearData.length - 1];
      return {
        year: `${yearIndex}年後`,
        現金: yearEndData.assetByType.cash,
        投資: yearEndData.assetByType.investment,
        不動産: yearEndData.assetByType.property,
        その他: yearEndData.assetByType.other,
      };
    });
  }, [result]);

  // キャッシュフローグラフデータの作成（年次集計）
  const cashFlowChartData = useMemo(() => {
    if (!result) return [];

    return Array.from({ length: 30 }).map((_, yearIndex) => {
      const monthIndex = yearIndex * 12;
      const yearData = result.monthlyData.slice(monthIndex, monthIndex + 12);

      if (yearData.length === 0) {
        return {
          year: `${yearIndex}年後`,
          収入: 0,
          支出: 0,
          ライフイベント費用: 0,
          純キャッシュフロー: 0,
          キャッシュ残高: 0,
        };
      }

      // 年間集計
      const yearExpense = yearData.reduce((sum, d) => sum + d.expense, 0);
      const yearWithdrawal = yearData.reduce((sum, d) => sum + d.withdrawalAmount, 0);

      // ライフイベント費用を費用と収入に分離（月次ごとに判定）
      const yearLifeEventExpense = yearData.reduce((sum, d) => {
        return sum + (d.lifeEventCost > 0 ? d.lifeEventCost : 0);
      }, 0);
      const yearPensionIncome = yearData.reduce((sum, d) => {
        return sum + (d.lifeEventCost < 0 ? Math.abs(d.lifeEventCost) : 0);
      }, 0);

      // 給与収入（投資取り崩しを除く）
      const yearSalaryIncome = yearData.reduce((sum, d) => sum + d.income, 0) - yearWithdrawal;

      const netCashFlow = yearData.reduce((sum, d) => sum + d.netCashFlow, 0);

      // 年末のキャッシュ残高を取得
      const yearEndData = yearData[yearData.length - 1];
      const cashBalance = yearEndData?.assetByType.cash || 0;

      // デバッグ: 初年度と11年後をログ出力
      if (yearIndex === 0 || yearIndex === 11) {
        console.log(`=== ${yearIndex}年後キャッシュフロー ===`);
        console.log('給与収入（月次income合計 - 投資取り崩し）:', yearSalaryIncome);
        console.log('年金収入（月次の負のlifeEventCost合計）:', yearPensionIncome);
        console.log('投資取り崩し:', yearWithdrawal);
        console.log('年間支出:', yearExpense);
        console.log('ライフイベント費用:', yearLifeEventExpense);
        console.log('純キャッシュフロー:', netCashFlow);
        console.log('年末キャッシュ残高:', cashBalance);

        // 各月のlifeEventCostを確認
        console.log('各月のlifeEventCost:');
        yearData.forEach((monthData, idx) => {
          console.log(`  ${idx + 1}月: lifeEventCost=${monthData.lifeEventCost}, income=${monthData.income}, withdrawalAmount=${monthData.withdrawalAmount}`);
        });

        console.log('月次データ（最初の月）:', yearData[0]);
        console.log('月次データ（最後の月）:', yearData[11]);
      }

      return {
        year: `${yearIndex}年後`,
        '収入（給与）': yearSalaryIncome,
        '収入（年金）': yearPensionIncome,
        '収入（投資引落）': yearWithdrawal,
        支出: -yearExpense, // 負の値として表示
        ライフイベント費用: -yearLifeEventExpense, // 負の値として表示
        純キャッシュフロー: netCashFlow,
        キャッシュ残高: cashBalance,
      };
    });
  }, [result]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">資産推移シミュレーション</h1>
          <p className="text-sm text-slate-600 mt-1">
            現在の資産と収支から、将来の資産推移を予測します
          </p>
        </div>
        {activeTab === 'simulation' && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            {showSettings ? '設定を閉じる' : '詳細設定'}
          </button>
        )}
      </div>

      {/* タブナビゲーション */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'simulation'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            シミュレーション実行
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'comparison'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            シナリオ比較
          </button>
        </div>
      </div>

      {/* シミュレーションタブ */}
      {activeTab === 'simulation' && (
        <>
          {/* 設定パネル */}
          {showSettings && (
            <div className="card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">シミュレーション設定</h2>

              {/* シナリオ選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  シナリオ選択
                </label>
                <select
                  value={settings.id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    if (selectedId === 'new') {
                      // 新規シナリオを作成
                      setSettings({
                        id: uuidv4(),
                        name: '新規シナリオ',
                        expectedReturns: {
                          cash: 0.001,
                          investment: 0.05,
                          property: 0.02,
                          insurance: 0.01,
                          other: 0.01,
                        },
                        inflationRate: 0.02,
                        futureIncome: [],
                        futureExpense: [],
                        withdrawal: {
                          enabled: false,
                          startDate: new Date(),
                          monthlyAmount: 0,
                        },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      });
                    } else {
                      loadSavedScenario(selectedId);
                    }
                  }}
                  className="input-modern w-full"
                >
                  <option value="new">新規シナリオを作成</option>
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* シナリオ名編集 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  シナリオ名
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => updateScenarioName(e.target.value)}
                  className="input-modern w-full"
                  placeholder="シナリオ名を入力"
                />
              </div>

              {/* プリセット */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  プリセットシナリオ
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => loadPreset('optimistic')}
                    className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    楽観的
                  </button>
                  <button
                    onClick={() => loadPreset('standard')}
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    標準
                  </button>
                  <button
                    onClick={() => loadPreset('pessimistic')}
                    className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                  >
                    悲観的
                  </button>
                </div>
              </div>

              {/* 運用利回り */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 inline-flex items-center">
                  運用利回り設定
                  <HelpTooltip content="各資産種別ごとの年間期待運用利回りを設定します。シミュレーションでは月次で按分して計算されます。" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1 inline-flex items-center">
                      現金・預金
                      <HelpTooltip content="普通預金・定期預金などの年利を設定します。一般的には0.001%〜0.1%程度です。" />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={(settings.expectedReturns.cash * 100).toFixed(2)}
                        onChange={(e) => updateExpectedReturn('cash', parseFloat(e.target.value))}
                        className="input-modern flex-1 text-right"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1 inline-flex items-center">
                      投資（株・投信等）
                      <HelpTooltip content="株式・投資信託などの年間期待リターンです。一般的には3%〜7%程度ですが、リスクも考慮してください。" />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={(settings.expectedReturns.investment * 100).toFixed(2)}
                        onChange={(e) => updateExpectedReturn('investment', parseFloat(e.target.value))}
                        className="input-modern flex-1 text-right"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1 inline-flex items-center">
                      不動産
                      <HelpTooltip content="不動産の年間期待価値上昇率です。立地や市況により異なりますが、1%〜3%程度が一般的です。" />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={(settings.expectedReturns.property * 100).toFixed(2)}
                        onChange={(e) => updateExpectedReturn('property', parseFloat(e.target.value))}
                        className="input-modern flex-1 text-right"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1 inline-flex items-center">
                      その他
                      <HelpTooltip content="保険・貴金属などその他資産の年間期待リターンです。" />
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={(settings.expectedReturns.other * 100).toFixed(2)}
                        onChange={(e) => updateExpectedReturn('other', parseFloat(e.target.value))}
                        className="input-modern flex-1 text-right"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* インフレ率 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 inline-flex items-center">
                  インフレ率
                  <HelpTooltip content="年間のインフレ率（物価上昇率）を設定します。日本では2%程度が目標とされています。将来の支出はこの率で増加します。" />
                </h3>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={(settings.inflationRate * 100).toFixed(2)}
                    onChange={(e) => updateInflationRate(parseFloat(e.target.value))}
                    className="input-modern flex-1 text-right"
                  />
                  <span className="text-sm text-slate-600">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  将来の支出額はこのインフレ率で調整されます
                </p>
              </div>

              {/* 投資資産取り崩し */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 inline-flex items-center">
                  投資資産取り崩し設定
                  <HelpTooltip content="退職後などに投資資産から毎月一定額を取り崩す計画を設定します。投資資産から現金に移動する金額を設定できます。" />
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="withdrawal-enabled"
                      checked={settings.withdrawal?.enabled || false}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          withdrawal: {
                            ...settings.withdrawal!,
                            enabled: e.target.checked,
                          },
                          updatedAt: new Date(),
                        });
                      }}
                      className="rounded"
                    />
                    <label htmlFor="withdrawal-enabled" className="text-sm text-slate-700 cursor-pointer">
                      投資資産の定期取り崩しを有効にする
                    </label>
                  </div>

                  {settings.withdrawal?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm text-slate-700 mb-1">開始時期</label>
                        <input
                          type="month"
                          value={settings.withdrawal.startDate ?
                            `${settings.withdrawal.startDate.getFullYear()}-${String(settings.withdrawal.startDate.getMonth() + 1).padStart(2, '0')}` :
                            ''}
                          onChange={(e) => {
                            const [year, month] = e.target.value.split('-').map(Number);
                            setSettings({
                              ...settings,
                              withdrawal: {
                                ...settings.withdrawal!,
                                startDate: new Date(year, month - 1, 1),
                              },
                              updatedAt: new Date(),
                            });
                          }}
                          className="input-modern max-w-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-700 mb-1">月額取り崩し金額 (円)</label>
                        <input
                          type="number"
                          step="10000"
                          min="0"
                          value={settings.withdrawal.monthlyAmount}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              withdrawal: {
                                ...settings.withdrawal!,
                                monthlyAmount: parseFloat(e.target.value) || 0,
                              },
                              updatedAt: new Date(),
                            });
                          }}
                          className="input-modern max-w-xs text-right"
                          placeholder="200000"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          毎月この金額が投資資産から現金に移動します
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* シミュレーション実行 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  シナリオ: {settings.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  期間: 30年（360ヶ月）|
                  現金利回り: {(settings.expectedReturns.cash * 100).toFixed(1)}% |
                  投資利回り: {(settings.expectedReturns.investment * 100).toFixed(1)}% |
                  インフレ率: {(settings.inflationRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveScenario}
                  disabled={isSaving}
                  className="px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? '保存中...' : 'シナリオ保存'}
                </button>
                <button
                  onClick={handleRunSimulation}
                  disabled={isCalculating}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? '計算中...' : 'シミュレーション実行'}
                </button>
              </div>
            </div>
          </div>

          {/* 結果表示 */}
          {result && (
            <div className="space-y-6">
              {/* サマリー */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <p className="text-sm opacity-90 mb-1">30年後の総資産</p>
                  <p className="text-2xl font-bold">
                    ¥{Math.round(result.summary.finalAssetBalance).toLocaleString()}
                  </p>
                </div>
                <div className="card p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <p className="text-sm opacity-90 mb-1">最大資産額</p>
                  <p className="text-2xl font-bold">
                    ¥{Math.round(result.summary.maxAssetBalance).toLocaleString()}
                  </p>
                </div>
                <div className="card p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <p className="text-sm opacity-90 mb-1">最小資産額</p>
                  <p className="text-2xl font-bold">
                    ¥{Math.round(result.summary.minAssetBalance).toLocaleString()}
                  </p>
                </div>
                <div className="card p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <p className="text-sm opacity-90 mb-1">総ライフイベント費用</p>
                  <p className="text-2xl font-bold">
                    ¥{Math.round(
                      result.monthlyData.reduce((sum, d) => sum + (d.lifeEventCost > 0 ? d.lifeEventCost : 0), 0)
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    ※年金等の収入は除く
                  </p>
                </div>
              </div>

              {/* 警告 */}
              {result.summary.warningMonths.length > 0 && (
                <div className="card p-4 bg-red-50 border border-red-200">
                  <p className="text-red-800 font-medium mb-2">⚠️ 警告</p>
                  <p className="text-red-700 text-sm">
                    資産がマイナスになる月が{result.summary.warningMonths.length}ヶ月あります。
                    収支の見直しやライフイベントの調整を検討してください。
                  </p>
                </div>
              )}

              {/* 資産推移グラフ（積み上げ棒グラフ） */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">資産推移（年次）</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="現金" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="投資" stackId="a" fill="#10b981" />
                    <Bar dataKey="不動産" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="その他" stackId="a" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* キャッシュフロー推移グラフ（積み上げ棒グラフ + 折れ線グラフ） */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">キャッシュフロー推移（年次）</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={cashFlowChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      interval={2}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
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
                      formatter={(value: number, name: string) => {
                        if (name === 'キャッシュ残高') {
                          return formatCurrency(value);
                        }
                        return formatCurrency(Math.abs(value));
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar yAxisId="left" dataKey="収入（給与）" stackId="income" fill="#10b981" />
                    <Bar yAxisId="left" dataKey="収入（年金）" stackId="income" fill="#3b82f6" />
                    <Bar yAxisId="left" dataKey="収入（投資引落）" stackId="income" fill="#06b6d4" />
                    <Bar yAxisId="left" dataKey="支出" stackId="expense" fill="#ef4444" />
                    <Bar yAxisId="left" dataKey="ライフイベント費用" stackId="expense" fill="#f97316" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="キャッシュ残高"
                      stroke="#1e293b"
                      strokeWidth={3}
                      dot={{ fill: '#1e293b', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {/* キャッシュ残高警告 */}
                  {cashFlowChartData.some((d) => d.キャッシュ残高 < 0) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium text-sm">
                        ⚠️ 警告: キャッシュ（現金）がマイナスになる年があります
                      </p>
                      <p className="text-red-700 text-xs mt-1">
                        該当年: {cashFlowChartData
                          .filter((d) => d.キャッシュ残高 < 0)
                          .map((d) => d.year)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  <div className="text-sm text-slate-600">
                    <p>※ 収入は正の値（+）、支出は負の値（-）で表示されています</p>
                    <p>※ 収入は給与収入、年金収入、投資取り崩しの3種類に分類されています</p>
                    <p>※ キャッシュ残高は折れ線グラフ（右軸）で各年末の現金残高を表示</p>
                  </div>
                </div>
              </div>

              {/* 年次推移テーブル */}
              <div className="card overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-base font-semibold text-slate-900">年次推移</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    ※ 赤くハイライトされた行は、キャッシュ（現金）がマイナスになる年です
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          年
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                          総資産額
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                          給与収入（取り崩し含む）
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                          年金収入
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                          年間支出
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                          ライフイベント費用
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {Array.from({ length: 30 }).map((_, yearIndex) => {
                        const monthIndex = yearIndex * 12;
                        const yearData = result.monthlyData.slice(monthIndex, monthIndex + 12);
                        if (yearData.length === 0) return null;

                        const yearEndAssets = yearData[yearData.length - 1]?.assetBalance || 0;
                        const yearWithdrawal = yearData.reduce((sum, d) => sum + d.withdrawalAmount, 0);

                        // ライフイベント費用を費用と収入に分離（月次ごとに判定）
                        const yearLifeEventExpense = yearData.reduce((sum, d) => {
                          return sum + (d.lifeEventCost > 0 ? d.lifeEventCost : 0);
                        }, 0);
                        const yearPensionIncome = yearData.reduce((sum, d) => {
                          return sum + (d.lifeEventCost < 0 ? Math.abs(d.lifeEventCost) : 0);
                        }, 0);

                        // 給与収入（投資取り崩しを含む）と年金収入を分離
                        const yearSalaryIncome = yearData.reduce((sum, d) => sum + d.income, 0);
                        const yearExpense = yearData.reduce((sum, d) => sum + d.expense, 0);

                        // 年末のキャッシュ残高を取得
                        const yearEndCashBalance = yearData[yearData.length - 1]?.assetByType.cash || 0;
                        const isCashNegative = yearEndCashBalance < 0;

                        return (
                          <tr
                            key={yearIndex}
                            className={`transition-colors ${
                              isCashNegative
                                ? 'bg-red-50 hover:bg-red-100'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {yearIndex}年後
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 font-semibold">
                              ¥{Math.round(yearEndAssets).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                              ¥{Math.round(yearSalaryIncome).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                              ¥{Math.round(yearPensionIncome).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                              ¥{Math.round(yearExpense).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              {yearLifeEventExpense === 0 ? (
                                <span className="text-slate-500">¥0</span>
                              ) : (
                                <span className="text-red-600 font-semibold">
                                  ¥{Math.round(yearLifeEventExpense).toLocaleString()}
                                </span>
                              )}
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
            <div className="card p-12 text-center">
              <p className="text-slate-600 mb-2">
                「シミュレーション実行」ボタンをクリックして、将来の資産推移を予測しましょう
              </p>
              <p className="text-sm text-slate-500">
                現在の資産、収支、ライフイベントを基に30年分の予測を行います
              </p>
            </div>
          )}
        </>
      )}

      {/* 比較タブ */}
      {activeTab === 'comparison' && <ScenarioComparison />}
    </div>
  );
}
