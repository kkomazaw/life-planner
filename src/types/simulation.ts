export type FrequencyType = 'monthly' | 'annually';

export interface FutureIncome {
  id: string;
  startDate: Date;
  endDate?: Date;
  amount: number;
  frequency: FrequencyType;
  description?: string;
}

export interface FutureExpense {
  id: string;
  startDate: Date;
  endDate?: Date;
  amount: number;
  frequency: FrequencyType;
  description?: string;
}

export interface ExpectedReturns {
  cash: number; // 年率（小数）例: 0.001 = 0.1%
  investment: number;
  property: number;
  insurance: number;
  other: number;
}

export interface WithdrawalSettings {
  enabled: boolean; // 取り崩しを有効にするか
  startDate: Date; // 取り崩し開始日
  monthlyAmount: number; // 月額取り崩し金額
}

export interface SimulationSettings {
  id: string;
  name: string; // シナリオ名
  expectedReturns: ExpectedReturns;
  inflationRate: number; // 年率（小数）
  futureIncome: FutureIncome[];
  futureExpense: FutureExpense[];
  withdrawal?: WithdrawalSettings; // 投資資産取り崩し設定
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlySimulationData {
  date: Date;
  assetBalance: number; // 総資産残高
  assetByType: {
    cash: number;
    investment: number;
    property: number;
    insurance: number;
    other: number;
  };
  income: number; // その月の収入
  expense: number; // その月の支出
  lifeEventCost: number; // その月のライフイベント費用
  netCashFlow: number; // 純キャッシュフロー
  withdrawalAmount: number; // 投資資産からの取り崩し金額
}

export interface SimulationResult {
  settingsId: string;
  startDate: Date;
  endDate: Date;
  monthlyData: MonthlySimulationData[];
  summary: {
    finalAssetBalance: number;
    maxAssetBalance: number;
    minAssetBalance: number;
    totalIncome: number;
    totalExpense: number;
    totalLifeEventCost: number;
    warningMonths: Date[]; // 資産がマイナスになる月
  };
}
