import Dexie, { type EntityTable } from 'dexie';
import type { Asset, AssetHistory } from '@/types/asset';
import type { Income, Expense, ExpenseCategory } from '@/types/transaction';
import type { LifeEvent } from '@/types/lifeEvent';
import type { SimulationSettings } from '@/types/simulation';

// データベースクラスの定義
class LifePlannerDatabase extends Dexie {
  assets!: EntityTable<Asset, 'id'>;
  assetHistory!: EntityTable<AssetHistory, 'id'>;
  incomes!: EntityTable<Income, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  expenseCategories!: EntityTable<ExpenseCategory, 'id'>;
  lifeEvents!: EntityTable<LifeEvent, 'id'>;
  simulationSettings!: EntityTable<SimulationSettings, 'id'>;

  constructor() {
    super('LifePlannerDB');

    this.version(1).stores({
      assets: 'id, type, acquisitionDate, createdAt',
      assetHistory: 'id, assetId, date, createdAt',
      incomes: 'id, date, source, createdAt',
      expenses: 'id, date, categoryId, createdAt',
      expenseCategories: 'id, type, order',
      lifeEvents: 'id, date, category, createdAt',
      simulationSettings: 'id, name, createdAt',
    });
  }
}

// データベースインスタンスをエクスポート
export const db = new LifePlannerDatabase();

// デフォルトの支出カテゴリを初期化
export async function initializeDefaultCategories() {
  const count = await db.expenseCategories.count();

  if (count === 0) {
    const defaultCategories: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // 固定費
      { name: '住宅費', type: 'fixed', order: 1 },
      { name: '光熱費', type: 'fixed', order: 2 },
      { name: '通信費', type: 'fixed', order: 3 },
      { name: '保険料', type: 'fixed', order: 4 },
      { name: 'サブスクリプション', type: 'fixed', order: 5 },
      // 変動費
      { name: '食費', type: 'variable', order: 6 },
      { name: '日用品費', type: 'variable', order: 7 },
      { name: '交通費', type: 'variable', order: 8 },
      { name: '医療費', type: 'variable', order: 9 },
      { name: '教育費', type: 'variable', order: 10 },
      { name: '娯楽費', type: 'variable', order: 11 },
      { name: '被服費', type: 'variable', order: 12 },
      // その他
      { name: 'その他', type: 'other', order: 13 },
    ];

    const now = new Date();
    const categoriesToAdd = defaultCategories.map((cat, index) => ({
      ...cat,
      id: `default-category-${index + 1}`,
      createdAt: now,
      updatedAt: now,
    }));

    await db.expenseCategories.bulkAdd(categoriesToAdd);
  }
}

// データベース初期化
export async function initializeDatabase() {
  await initializeDefaultCategories();
}
