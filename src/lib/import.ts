import * as XLSX from 'xlsx';
import type { Asset, AssetHistory } from '@/types/asset';
import type { Income, Expense, ExpenseCategory } from '@/types/transaction';
import type { LifeEvent } from '@/types/lifeEvent';

export interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    assets?: Asset[];
    assetHistory?: AssetHistory[];
    incomes?: Income[];
    expenses?: Expense[];
    expenseCategories?: ExpenseCategory[];
    lifeEvents?: LifeEvent[];
  };
  errors?: string[];
}

/**
 * CSVファイルをパースしてデータを抽出
 */
export function parseCSVFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        resolve(jsonData as any[][]);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Excelファイルをパースしてシート別にデータを抽出
 */
export function parseExcelFile(file: File): Promise<Record<string, any[][]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheets: Record<string, any[][]> = {};

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          sheets[sheetName] = jsonData as any[][];
        });

        resolve(sheets);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsBinaryString(file);
  });
}

/**
 * 資産データのインポート
 */
export function importAssets(data: any[][]): ImportResult {
  const errors: string[] = [];
  const assets: Partial<Asset>[] = [];

  // ヘッダー行をスキップ
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    try {
      const [name, typeLabel, acquisitionDate, , memo] = row;

      if (!name) {
        errors.push(`${i + 1}行目: 資産名が必要です`);
        continue;
      }

      // 種別のマッピング
      const typeMap: Record<string, 'cash' | 'investment' | 'property' | 'other'> = {
        '現金・預金': 'cash',
        投資: 'investment',
        不動産: 'property',
        その他: 'other',
      };

      const type = typeMap[typeLabel] || 'other';

      assets.push({
        name: String(name),
        type,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : new Date(),
        memo: memo ? String(memo) : '',
      });
    } catch (error) {
      errors.push(`${i + 1}行目: データの解析に失敗しました`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: `${errors.length}件のエラーがあります`,
      errors,
    };
  }

  return {
    success: true,
    message: `${assets.length}件の資産をインポートしました`,
    data: { assets: assets as Asset[] },
  };
}

/**
 * 収入データのインポート
 */
export function importIncomes(data: any[][]): ImportResult {
  const errors: string[] = [];
  const incomes: Partial<Income>[] = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    try {
      const [yearMonth, source, amount, memo] = row;

      if (!yearMonth || !source || !amount) {
        errors.push(`${i + 1}行目: 年月、収入源、金額が必要です`);
        continue;
      }

      incomes.push({
        date: new Date(yearMonth),
        source: String(source),
        amount: Number(amount),
        memo: memo ? String(memo) : '',
      });
    } catch (error) {
      errors.push(`${i + 1}行目: データの解析に失敗しました`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: `${errors.length}件のエラーがあります`,
      errors,
    };
  }

  return {
    success: true,
    message: `${incomes.length}件の収入をインポートしました`,
    data: { incomes: incomes as Income[] },
  };
}

/**
 * 支出データのインポート
 */
export function importExpenses(data: any[][], categories: ExpenseCategory[]): ImportResult {
  const errors: string[] = [];
  const expenses: Partial<Expense>[] = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    try {
      const [yearMonth, categoryName, amount, memo] = row;

      if (!yearMonth || !categoryName || !amount) {
        errors.push(`${i + 1}行目: 年月、カテゴリ、金額が必要です`);
        continue;
      }

      // カテゴリ名からIDを検索
      const category = categories.find((c) => c.name === categoryName);
      if (!category) {
        errors.push(`${i + 1}行目: カテゴリ「${categoryName}」が見つかりません`);
        continue;
      }

      expenses.push({
        date: new Date(yearMonth),
        categoryId: category.id,
        amount: Number(amount),
        memo: memo ? String(memo) : '',
      });
    } catch (error) {
      errors.push(`${i + 1}行目: データの解析に失敗しました`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: `${errors.length}件のエラーがあります`,
      errors,
    };
  }

  return {
    success: true,
    message: `${expenses.length}件の支出をインポートしました`,
    data: { expenses: expenses as Expense[] },
  };
}

/**
 * ライフイベントデータのインポート
 */
export function importLifeEvents(data: any[][]): ImportResult {
  const errors: string[] = [];
  const lifeEvents: Partial<LifeEvent>[] = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    try {
      const [name, date, categoryLabel, estimatedCost, memo] = row;

      if (!name || !date || !estimatedCost) {
        errors.push(`${i + 1}行目: イベント名、発生時期、予想費用が必要です`);
        continue;
      }

      // カテゴリのマッピング
      const categoryMap: Record<string, LifeEvent['category']> = {
        教育: 'education',
        住宅: 'housing',
        車両: 'vehicle',
        退職: 'retirement',
        その他: 'other',
      };

      const category = categoryMap[categoryLabel] || 'other';

      lifeEvents.push({
        name: String(name),
        date: new Date(date),
        category,
        estimatedCost: Number(estimatedCost),
        memo: memo ? String(memo) : '',
      });
    } catch (error) {
      errors.push(`${i + 1}行目: データの解析に失敗しました`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: `${errors.length}件のエラーがあります`,
      errors,
    };
  }

  return {
    success: true,
    message: `${lifeEvents.length}件のライフイベントをインポートしました`,
    data: { lifeEvents: lifeEvents as LifeEvent[] },
  };
}

/**
 * インポートデータの検証
 */
export function validateImportData(type: string, data: any[][]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || data.length < 2) {
    errors.push('データが空です（ヘッダー行のみ、またはデータなし）');
    return { valid: false, errors };
  }

  const headers = data[0];
  const requiredHeaders: Record<string, string[]> = {
    assets: ['資産名', '種別', '取得日'],
    incomes: ['年月', '収入源', '金額'],
    expenses: ['年月', 'カテゴリ', '金額'],
    lifeEvents: ['イベント名', '発生時期', '予想費用'],
  };

  const required = requiredHeaders[type];
  if (!required) {
    errors.push('不明なデータ種別です');
    return { valid: false, errors };
  }

  const missingHeaders = required.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    errors.push(`必須項目が不足しています: ${missingHeaders.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
