import { addMonths, startOfMonth } from 'date-fns';
import type { Asset, AssetHistory, AssetType } from '@/types/asset';
import type { LifeEvent } from '@/types/lifeEvent';
import type { Income, Expense } from '@/types/transaction';
import type {
  SimulationSettings,
  SimulationResult,
  MonthlySimulationData,
} from '@/types/simulation';

interface SimulationInput {
  settings: SimulationSettings;
  currentAssets: Asset[];
  assetHistory: AssetHistory[];
  lifeEvents: LifeEvent[];
  incomes: Income[];
  expenses: Expense[];
}

/**
 * シミュレーション計算のメイン関数
 * 現在の資産状況から30年分（360ヶ月）の将来予測を計算
 */
export function runSimulation(input: SimulationInput): SimulationResult {
  const { settings, currentAssets, assetHistory, lifeEvents, incomes, expenses } = input;

  const startDate = startOfMonth(new Date());
  const endDate = addMonths(startDate, 360); // 30年 = 360ヶ月

  // 現在の資産残高を取得
  const initialAssets = getCurrentAssetValues(currentAssets, assetHistory);

  // 過去の平均収支を計算（将来予測のベースライン）
  const averageMonthlyIncome = calculateAverageMonthlyIncome(incomes);
  const averageMonthlyExpense = calculateAverageMonthlyExpense(expenses);

  const monthlyData: MonthlySimulationData[] = [];
  let currentDate = startDate;
  let currentAssetsByType = { ...initialAssets };

  // 360ヶ月分をシミュレーション
  for (let i = 0; i < 360; i++) {
    // 1. 運用利回りを適用（月次換算）
    const returnsApplied = applyReturns(currentAssetsByType, settings.expectedReturns);

    // 2. その月の収入を計算
    const monthlyIncome = calculateMonthlyIncome(
      currentDate,
      averageMonthlyIncome,
      settings.futureIncome
    );

    // 3. その月の支出を計算
    const monthlyExpense = calculateMonthlyExpense(
      currentDate,
      averageMonthlyExpense,
      settings.futureExpense,
      settings.inflationRate,
      i
    );

    // 4. その月のライフイベント費用を計算
    const lifeEventCost = calculateLifeEventCost(currentDate, lifeEvents);

    // 5. 純キャッシュフロー = 収入 - 支出 - ライフイベント費用
    const netCashFlow = monthlyIncome - monthlyExpense - lifeEventCost;

    // 6. キャッシュフローを現金資産に反映
    currentAssetsByType.cash = returnsApplied.cash + netCashFlow;

    // 7. 総資産残高を計算
    const totalAssets =
      currentAssetsByType.cash +
      currentAssetsByType.investment +
      currentAssetsByType.property +
      currentAssetsByType.other;

    // 8. 月次データを記録
    monthlyData.push({
      date: currentDate,
      assetBalance: totalAssets,
      assetByType: { ...currentAssetsByType },
      income: monthlyIncome,
      expense: monthlyExpense,
      lifeEventCost,
      netCashFlow,
    });

    // 次の月へ
    currentDate = addMonths(currentDate, 1);
  }

  // サマリーを計算
  const summary = calculateSummary(monthlyData, initialAssets);

  return {
    settingsId: settings.id,
    startDate,
    endDate,
    monthlyData,
    summary,
  };
}

/**
 * 現在の資産評価額を資産種別ごとに集計
 */
function getCurrentAssetValues(
  assets: Asset[],
  assetHistory: AssetHistory[]
): Record<AssetType, number> {
  const values: Record<AssetType, number> = {
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
    values[asset.type] += latestValue;
  });

  return values;
}

/**
 * 過去の平均月次収入を計算
 */
function calculateAverageMonthlyIncome(incomes: Income[]): number {
  if (incomes.length === 0) return 0;
  const total = incomes.reduce((sum, income) => sum + income.amount, 0);
  return total / incomes.length;
}

/**
 * 過去の平均月次支出を計算
 */
function calculateAverageMonthlyExpense(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return total / expenses.length;
}

/**
 * 運用利回りを適用（年率を月率に変換して適用）
 */
function applyReturns(
  assets: Record<AssetType, number>,
  expectedReturns: SimulationSettings['expectedReturns']
): Record<AssetType, number> {
  const monthlyReturns = {
    cash: expectedReturns.cash / 12,
    investment: expectedReturns.investment / 12,
    property: expectedReturns.property / 12,
    other: expectedReturns.other / 12,
  };

  return {
    cash: assets.cash * (1 + monthlyReturns.cash),
    investment: assets.investment * (1 + monthlyReturns.investment),
    property: assets.property * (1 + monthlyReturns.property),
    other: assets.other * (1 + monthlyReturns.other),
  };
}

/**
 * 特定月の収入を計算
 */
function calculateMonthlyIncome(
  date: Date,
  baselineIncome: number,
  futureIncomes: SimulationSettings['futureIncome']
): number {
  let total = baselineIncome;

  futureIncomes.forEach((income) => {
    if (date >= income.startDate && (!income.endDate || date <= income.endDate)) {
      if (income.frequency === 'monthly') {
        total += income.amount;
      } else if (
        income.frequency === 'annually' &&
        date.getMonth() === income.startDate.getMonth()
      ) {
        total += income.amount;
      }
    }
  });

  return total;
}

/**
 * 特定月の支出を計算（インフレ調整含む）
 */
function calculateMonthlyExpense(
  date: Date,
  baselineExpense: number,
  futureExpenses: SimulationSettings['futureExpense'],
  inflationRate: number,
  monthsElapsed: number
): number {
  // インフレ調整（複利計算）
  const inflationAdjustment = Math.pow(1 + inflationRate / 12, monthsElapsed);
  let total = baselineExpense * inflationAdjustment;

  futureExpenses.forEach((expense) => {
    if (date >= expense.startDate && (!expense.endDate || date <= expense.endDate)) {
      const adjustedAmount = expense.amount * inflationAdjustment;

      if (expense.frequency === 'monthly') {
        total += adjustedAmount;
      } else if (
        expense.frequency === 'annually' &&
        date.getMonth() === expense.startDate.getMonth()
      ) {
        total += adjustedAmount;
      }
    }
  });

  return total;
}

/**
 * 特定月のライフイベント費用を計算
 */
function calculateLifeEventCost(date: Date, lifeEvents: LifeEvent[]): number {
  let total = 0;

  lifeEvents.forEach((event) => {
    if (
      event.date.getFullYear() === date.getFullYear() &&
      event.date.getMonth() === date.getMonth()
    ) {
      total += event.estimatedCost;
    }
  });

  return total;
}

/**
 * シミュレーション結果のサマリーを計算
 */
function calculateSummary(
  monthlyData: MonthlySimulationData[],
  initialAssets: Record<AssetType, number>
): SimulationResult['summary'] {
  const initialTotal =
    initialAssets.cash + initialAssets.investment + initialAssets.property + initialAssets.other;

  let maxAssetBalance = initialTotal;
  let minAssetBalance = initialTotal;
  let totalIncome = 0;
  let totalExpense = 0;
  let totalLifeEventCost = 0;
  const warningMonths: Date[] = [];

  monthlyData.forEach((data) => {
    if (data.assetBalance > maxAssetBalance) {
      maxAssetBalance = data.assetBalance;
    }
    if (data.assetBalance < minAssetBalance) {
      minAssetBalance = data.assetBalance;
    }
    if (data.assetBalance < 0) {
      warningMonths.push(data.date);
    }

    totalIncome += data.income;
    totalExpense += data.expense;
    totalLifeEventCost += data.lifeEventCost;
  });

  const finalAssetBalance = monthlyData[monthlyData.length - 1]?.assetBalance || 0;

  return {
    finalAssetBalance,
    maxAssetBalance,
    minAssetBalance,
    totalIncome,
    totalExpense,
    totalLifeEventCost,
    warningMonths,
  };
}
