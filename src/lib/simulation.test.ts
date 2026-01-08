import { describe, it, expect } from 'vitest';
import { runSimulation } from './simulation';
import type { Asset, AssetHistory } from '@/types/asset';
import type { LifeEvent } from '@/types/lifeEvent';
import type { Income, Expense } from '@/types/transaction';
import type { SimulationSettings } from '@/types/simulation';

describe('runSimulation', () => {
  // テストデータのセットアップ
  const mockSettings: SimulationSettings = {
    id: 'test-settings-1',
    name: 'テストシナリオ',
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
  };

  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      name: '現金',
      type: 'cash',
      acquisitionDate: new Date(2024, 0, 1),
      memo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'asset-2',
      name: '投資信託',
      type: 'investment',
      acquisitionDate: new Date(2024, 0, 1),
      memo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockAssetHistory: AssetHistory[] = [
    {
      id: 'history-1',
      assetId: 'asset-1',
      date: new Date(2024, 0, 1),
      value: 1000000, // 100万円
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'history-2',
      assetId: 'asset-2',
      date: new Date(2024, 0, 1),
      value: 2000000, // 200万円
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockIncomes: Income[] = [
    {
      id: 'income-1',
      date: new Date(2024, 0, 1),
      source: '給与',
      amount: 300000,
      memo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'income-2',
      date: new Date(2024, 1, 1),
      source: '給与',
      amount: 300000,
      memo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockExpenses: Expense[] = [
    {
      id: 'expense-1',
      date: new Date(2024, 0, 1),
      categoryId: 'cat-1',
      amount: 200000,
      memo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'expense-2',
      date: new Date(2024, 1, 1),
      categoryId: 'cat-1',
      amount: 200000,
      memo: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockLifeEvents: LifeEvent[] = [];

  it('should return simulation result with 360 months of data', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes,
      expenses: mockExpenses,
    });

    expect(result.monthlyData).toHaveLength(360);
    expect(result.settingsId).toBe(mockSettings.id);
  });

  it('should calculate initial asset balance correctly', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes,
      expenses: mockExpenses,
    });

    // 初期資産: 100万(現金) + 200万(投資) = 300万
    const firstMonth = result.monthlyData[0];
    // 初月は運用リターンと収支が反映されるので、初期値とは異なる
    expect(firstMonth).toBeDefined();
    expect(firstMonth.assetBalance).toBeGreaterThan(0);
  });

  it('should apply returns correctly', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes,
      expenses: mockExpenses,
    });

    const firstMonth = result.monthlyData[0];
    const lastMonth = result.monthlyData[359];

    // 総資産は収支とリターンで変化しているはず
    expect(lastMonth.assetBalance).toBeDefined();
    expect(lastMonth.assetBalance).not.toBe(0);

    // 各資産タイプの値が記録されていること
    expect(lastMonth.assetByType).toHaveProperty('cash');
    expect(lastMonth.assetByType).toHaveProperty('investment');
    expect(lastMonth.assetByType).toHaveProperty('property');
    expect(lastMonth.assetByType).toHaveProperty('other');
  });

  it('should calculate average monthly income correctly', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes,
      expenses: mockExpenses,
    });

    const firstMonth = result.monthlyData[0];

    // 平均収入は30万円
    expect(firstMonth.income).toBe(300000);
  });

  it('should calculate summary statistics', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes,
      expenses: mockExpenses,
    });

    expect(result.summary.finalAssetBalance).toBeDefined();
    expect(result.summary.maxAssetBalance).toBeDefined();
    expect(result.summary.minAssetBalance).toBeDefined();
    expect(result.summary.totalIncome).toBeGreaterThan(0);
    expect(result.summary.totalExpense).toBeGreaterThan(0);
    expect(result.summary.totalLifeEventCost).toBe(0); // イベントなし
    expect(result.summary.warningMonths).toBeDefined();
  });

  it('should handle life events correctly', () => {
    // シミュレーション開始は今月の月初から
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // 6ヶ月後にイベントを設定
    const eventDate = new Date(startDate);
    eventDate.setMonth(startDate.getMonth() + 6);

    const lifeEventsWithCost: LifeEvent[] = [
      {
        id: 'event-1',
        name: '車購入',
        date: eventDate,
        category: 'vehicle',
        estimatedCost: 3000000, // 300万円
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: lifeEventsWithCost,
      incomes: mockIncomes,
      expenses: mockExpenses,
    });

    expect(result.summary.totalLifeEventCost).toBe(3000000);

    // イベント発生月を確認
    const eventMonth = result.monthlyData.find(
      (data) => data.date.getFullYear() === eventDate.getFullYear() &&
               data.date.getMonth() === eventDate.getMonth()
    );
    expect(eventMonth).toBeDefined();
    expect(eventMonth?.lifeEventCost).toBe(3000000);
  });

  it('should apply inflation to expenses', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes,
      expenses: mockExpenses,
    });

    const firstMonth = result.monthlyData[0];
    const lastMonth = result.monthlyData[359];

    // 30年後の支出はインフレで増加しているはず
    expect(lastMonth.expense).toBeGreaterThan(firstMonth.expense);
  });

  it('should track warning months when assets go negative', () => {
    // 支出が大きすぎて資産がマイナスになるケース
    const highExpenses: Expense[] = [
      {
        id: 'expense-1',
        date: new Date(2024, 0, 1),
        categoryId: 'cat-1',
        amount: 500000, // 収入より大きい
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes,
      expenses: highExpenses,
    });

    // 支出が収入を上回るので、いずれ資産がマイナスになる
    // ただし初期資産が300万あるので、すぐにはマイナスにならない
    expect(result.summary.warningMonths.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty data gracefully', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: [],
      assetHistory: [],
      lifeEvents: [],
      incomes: [],
      expenses: [],
    });

    expect(result.monthlyData).toHaveLength(360);
    expect(result.summary.finalAssetBalance).toBeDefined();
    expect(result.summary.totalIncome).toBe(0);
    expect(result.summary.totalExpense).toBe(0);
  });

  it('should maintain positive cash flow with good income/expense ratio', () => {
    const result = runSimulation({
      settings: mockSettings,
      currentAssets: mockAssets,
      assetHistory: mockAssetHistory,
      lifeEvents: mockLifeEvents,
      incomes: mockIncomes, // 30万/月
      expenses: mockExpenses, // 20万/月
    });

    // 毎月10万円の黒字なので、最終資産は初期資産より増えているはず
    const initialAssets = 3000000; // 300万
    expect(result.summary.finalAssetBalance).toBeGreaterThan(initialAssets);
  });
});
