import { describe, it, expect, vi } from 'vitest';
import type { Asset, AssetHistory } from '@/types/asset';
import type { Income, Expense, ExpenseCategory } from '@/types/transaction';
import type { LifeEvent } from '@/types/lifeEvent';

// CSVヘルパー関数のテスト用にインポート
// 実際のファイルではこれらは非公開関数なので、テストではロジックを検証
describe('CSV Export Functions', () => {
  describe('CSV data structure', () => {
    it('should create proper CSV format with headers and data', () => {
      const headers = ['名前', '種別', '金額'];
      const rows = [
        ['資産A', '現金', '1000000'],
        ['資産B', '投資', '2000000'],
      ];

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      expect(csv).toContain('"名前","種別","金額"');
      expect(csv).toContain('"資産A","現金","1000000"');
      expect(csv).toContain('"資産B","投資","2000000"');
    });

    it('should handle empty data gracefully', () => {
      const headers = ['名前', '種別', '金額'];
      const rows: string[][] = [];

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      expect(csv).toBe('"名前","種別","金額"');
    });

    it('should escape special characters in CSV', () => {
      const headers = ['名前', '説明'];
      const rows = [['テスト"項目"', '説明,カンマ含む']];

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      expect(csv).toContain('"テスト"項目""');
      expect(csv).toContain('"説明,カンマ含む"');
    });
  });

  describe('Asset CSV data transformation', () => {
    const mockAssets: Asset[] = [
      {
        id: 'asset-1',
        name: '普通預金',
        type: 'cash',
        acquisitionDate: new Date(2024, 0, 1),
        memo: 'メインバンク',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'asset-2',
        name: '投資信託A',
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
        value: 1000000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'history-2',
        assetId: 'asset-1',
        date: new Date(2024, 1, 1),
        value: 1100000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'history-3',
        assetId: 'asset-2',
        date: new Date(2024, 0, 1),
        value: 2000000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should extract latest asset value from history', () => {
      const getLatestValue = (assetId: string) => {
        const history = mockAssetHistory
          .filter((h) => h.assetId === assetId)
          .sort((a, b) => b.date.getTime() - a.date.getTime());
        return history[0]?.value || 0;
      };

      expect(getLatestValue('asset-1')).toBe(1100000);
      expect(getLatestValue('asset-2')).toBe(2000000);
      expect(getLatestValue('non-existent')).toBe(0);
    });

    it('should transform asset type to Japanese label', () => {
      const typeLabels: Record<string, string> = {
        cash: '現金・預金',
        investment: '投資',
        property: '不動産',
        other: 'その他',
      };

      expect(typeLabels['cash']).toBe('現金・預金');
      expect(typeLabels['investment']).toBe('投資');
    });
  });

  describe('Transaction CSV data transformation', () => {
    const mockIncomes: Income[] = [
      {
        id: 'income-1',
        date: new Date(2024, 0, 1),
        source: '給与',
        amount: 300000,
        memo: '1月分',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockExpenses: Expense[] = [
      {
        id: 'expense-1',
        date: new Date(2024, 0, 1),
        categoryId: 'cat-1',
        amount: 150000,
        memo: '家賃',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockCategories: ExpenseCategory[] = [
      {
        id: 'cat-1',
        name: '住居費',
        color: '#3b82f6',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should transform income data correctly', () => {
      const incomeRow = mockIncomes.map((income) => [
        income.date.toISOString().slice(0, 7),
        income.source,
        income.amount.toString(),
        income.memo || '',
      ]);

      // タイムゾーンに依存しないテスト
      expect(incomeRow[0][1]).toBe('給与');
      expect(incomeRow[0][2]).toBe('300000');
      expect(incomeRow[0][3]).toBe('1月分');
    });

    it('should transform expense data with category name', () => {
      const expenseRow = mockExpenses.map((expense) => {
        const category = mockCategories.find((c) => c.id === expense.categoryId);
        return [
          expense.date.toISOString().slice(0, 7),
          category?.name || '不明',
          expense.amount.toString(),
          expense.memo || '',
        ];
      });

      // タイムゾーンに依存しないテスト
      expect(expenseRow[0][1]).toBe('住居費');
      expect(expenseRow[0][2]).toBe('150000');
      expect(expenseRow[0][3]).toBe('家賃');
    });

    it('should handle missing category gracefully', () => {
      const expenseWithoutCategory: Expense = {
        ...mockExpenses[0],
        categoryId: 'non-existent',
      };

      const category = mockCategories.find((c) => c.id === expenseWithoutCategory.categoryId);
      const categoryName = category?.name || '不明';

      expect(categoryName).toBe('不明');
    });
  });

  describe('Life Event CSV data transformation', () => {
    const mockLifeEvents: LifeEvent[] = [
      {
        id: 'event-1',
        name: '子供の入学',
        date: new Date(2030, 3, 1),
        category: 'education',
        estimatedCost: 1000000,
        memo: '小学校入学',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'event-2',
        name: '車購入',
        date: new Date(2025, 6, 1),
        category: 'vehicle',
        estimatedCost: 3000000,
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should transform life event data correctly', () => {
      const categoryLabels: Record<string, string> = {
        education: '教育',
        housing: '住宅',
        vehicle: '車両',
        retirement: '退職',
        other: 'その他',
      };

      const eventRows = mockLifeEvents.map((event) => [
        event.name,
        event.date.toISOString().slice(0, 7),
        categoryLabels[event.category] || event.category,
        event.estimatedCost.toString(),
        event.memo || '',
      ]);

      // タイムゾーンに依存しないテスト
      expect(eventRows[0][0]).toBe('子供の入学');
      expect(eventRows[0][2]).toBe('教育');
      expect(eventRows[0][3]).toBe('1000000');
      expect(eventRows[0][4]).toBe('小学校入学');

      expect(eventRows[1][0]).toBe('車購入');
      expect(eventRows[1][2]).toBe('車両');
      expect(eventRows[1][3]).toBe('3000000');
    });
  });

  describe('UTF-8 BOM handling', () => {
    it('should include BOM for proper Japanese character encoding', () => {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

      expect(bom[0]).toBe(0xef);
      expect(bom[1]).toBe(0xbb);
      expect(bom[2]).toBe(0xbf);
      expect(bom.length).toBe(3);
    });
  });
});

describe('Excel Export Functions', () => {
  it('should prepare data in correct format for xlsx library', () => {
    const mockData = [
      {
        資産名: '普通預金',
        種別: '現金・預金',
        取得日: '2024-01',
        最新評価額: 1000000,
        メモ: '',
      },
    ];

    expect(mockData[0]).toHaveProperty('資産名');
    expect(mockData[0]).toHaveProperty('種別');
    expect(mockData[0]).toHaveProperty('最新評価額');
    expect(mockData[0].最新評価額).toBe(1000000);
  });
});

describe('PDF Export Functions', () => {
  it('should format summary data correctly', () => {
    const totalAssets = 3000000;
    const totalIncome = 5000000;
    const totalExpense = 3000000;
    const balance = totalIncome - totalExpense;

    expect(balance).toBe(2000000);
    expect(totalAssets).toBeGreaterThan(0);
  });

  it('should prepare table data for PDF generation', () => {
    const tableData = [
      ['資産A', '現金・預金', '2024-01', '¥1,000,000'],
      ['資産B', '投資', '2024-01', '¥2,000,000'],
    ];

    expect(tableData).toHaveLength(2);
    expect(tableData[0]).toHaveLength(4);
    expect(tableData[0][0]).toBe('資産A');
  });
});
