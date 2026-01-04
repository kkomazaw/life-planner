import * as XLSX from 'xlsx';
import { formatYearMonth } from './utils';
import type { Asset, AssetHistory } from '@/types/asset';
import type { Income, Expense, ExpenseCategory } from '@/types/transaction';
import type { LifeEvent } from '@/types/lifeEvent';

/**
 * CSVとして文字列を生成
 */
function generateCSV(headers: string[], rows: string[][]): string {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  return csvContent;
}

/**
 * CSVファイルをダウンロード
 */
function downloadCSV(filename: string, content: string) {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]); // UTF-8 BOM
  const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 資産データをCSV出力
 */
export function exportAssetsToCSV(assets: Asset[], assetHistory: AssetHistory[]) {
  const headers = ['資産名', '種別', '取得日', '最新評価額', 'メモ'];
  const rows = assets.map((asset) => {
    const history = assetHistory
      .filter((h) => h.assetId === asset.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const latestValue = history[0]?.value || 0;

    const typeLabels: Record<string, string> = {
      cash: '現金・預金',
      investment: '投資',
      property: '不動産',
      other: 'その他',
    };

    return [
      asset.name,
      typeLabels[asset.type] || asset.type,
      formatYearMonth(asset.acquisitionDate),
      latestValue.toString(),
      asset.memo || '',
    ];
  });

  const csv = generateCSV(headers, rows);
  downloadCSV(`資産一覧_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

/**
 * 収支データをCSV出力
 */
export function exportTransactionsToCSV(
  incomes: Income[],
  expenses: Expense[],
  expenseCategories: ExpenseCategory[]
) {
  // 収入CSV
  const incomeHeaders = ['年月', '収入源', '金額', 'メモ'];
  const incomeRows = incomes.map((income) => [
    formatYearMonth(income.date),
    income.source,
    income.amount.toString(),
    income.memo || '',
  ]);
  const incomeCSV = generateCSV(incomeHeaders, incomeRows);
  downloadCSV(`収入一覧_${new Date().toISOString().split('T')[0]}.csv`, incomeCSV);

  // 支出CSV
  const expenseHeaders = ['年月', 'カテゴリ', '金額', 'メモ'];
  const expenseRows = expenses.map((expense) => {
    const category = expenseCategories.find((c) => c.id === expense.categoryId);
    return [
      formatYearMonth(expense.date),
      category?.name || '不明',
      expense.amount.toString(),
      expense.memo || '',
    ];
  });
  const expenseCSV = generateCSV(expenseHeaders, expenseRows);
  downloadCSV(`支出一覧_${new Date().toISOString().split('T')[0]}.csv`, expenseCSV);
}

/**
 * ライフイベントをCSV出力
 */
export function exportLifeEventsToCSV(lifeEvents: LifeEvent[]) {
  const headers = ['イベント名', '発生時期', 'カテゴリ', '予想費用', 'メモ'];

  const categoryLabels: Record<string, string> = {
    education: '教育',
    housing: '住宅',
    vehicle: '車両',
    retirement: '退職',
    other: 'その他',
  };

  const rows = lifeEvents.map((event) => [
    event.name,
    formatYearMonth(event.date),
    categoryLabels[event.category] || event.category,
    event.estimatedCost.toString(),
    event.memo || '',
  ]);

  const csv = generateCSV(headers, rows);
  downloadCSV(`ライフイベント_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

/**
 * すべてのデータをExcel形式でエクスポート
 */
export function exportAllToExcel(
  assets: Asset[],
  assetHistory: AssetHistory[],
  incomes: Income[],
  expenses: Expense[],
  expenseCategories: ExpenseCategory[],
  lifeEvents: LifeEvent[]
) {
  const wb = XLSX.utils.book_new();

  // 資産シート
  const assetData = assets.map((asset) => {
    const history = assetHistory
      .filter((h) => h.assetId === asset.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    const latestValue = history[0]?.value || 0;

    const typeLabels: Record<string, string> = {
      cash: '現金・預金',
      investment: '投資',
      property: '不動産',
      other: 'その他',
    };

    return {
      資産名: asset.name,
      種別: typeLabels[asset.type] || asset.type,
      取得日: formatYearMonth(asset.acquisitionDate),
      最新評価額: latestValue,
      メモ: asset.memo || '',
    };
  });
  const assetSheet = XLSX.utils.json_to_sheet(assetData);
  XLSX.utils.book_append_sheet(wb, assetSheet, '資産');

  // 収入シート
  const incomeData = incomes.map((income) => ({
    年月: formatYearMonth(income.date),
    収入源: income.source,
    金額: income.amount,
    メモ: income.memo || '',
  }));
  const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(wb, incomeSheet, '収入');

  // 支出シート
  const expenseData = expenses.map((expense) => {
    const category = expenseCategories.find((c) => c.id === expense.categoryId);
    return {
      年月: formatYearMonth(expense.date),
      カテゴリ: category?.name || '不明',
      金額: expense.amount,
      メモ: expense.memo || '',
    };
  });
  const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(wb, expenseSheet, '支出');

  // ライフイベントシート
  const categoryLabels: Record<string, string> = {
    education: '教育',
    housing: '住宅',
    vehicle: '車両',
    retirement: '退職',
    other: 'その他',
  };

  const lifeEventData = lifeEvents.map((event) => ({
    イベント名: event.name,
    発生時期: formatYearMonth(event.date),
    カテゴリ: categoryLabels[event.category] || event.category,
    予想費用: event.estimatedCost,
    メモ: event.memo || '',
  }));
  const lifeEventSheet = XLSX.utils.json_to_sheet(lifeEventData);
  XLSX.utils.book_append_sheet(wb, lifeEventSheet, 'ライフイベント');

  // ファイル出力
  XLSX.writeFile(wb, `LifePlanner_${new Date().toISOString().split('T')[0]}.xlsx`);
}
