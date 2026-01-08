import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatYearMonth, formatCurrency } from './utils';
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

/**
 * すべてのデータをCSV形式でエクスポート（個別ダウンロード）
 */
export function exportAllToCSV(
  assets: Asset[],
  assetHistory: AssetHistory[],
  incomes: Income[],
  expenses: Expense[],
  expenseCategories: ExpenseCategory[],
  lifeEvents: LifeEvent[]
) {
  // 資産CSV
  exportAssetsToCSV(assets, assetHistory);

  // 収支CSV
  exportTransactionsToCSV(incomes, expenses, expenseCategories);

  // ライフイベントCSV
  exportLifeEventsToCSV(lifeEvents);
}

/**
 * すべてのデータをPDF形式でエクスポート
 */
export function exportAllToPDF(
  assets: Asset[],
  assetHistory: AssetHistory[],
  incomes: Income[],
  expenses: Expense[],
  expenseCategories: ExpenseCategory[],
  lifeEvents: LifeEvent[]
) {
  const doc = new jsPDF();

  // 日本語フォント設定（デフォルトフォントを使用）
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // タイトル
  doc.setFontSize(18);
  doc.text('Life Planner レポート', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.text(`出力日: ${new Date().toLocaleDateString('ja-JP')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // サマリー
  const totalAssets = assets.reduce((total, asset) => {
    const history = assetHistory
      .filter((h) => h.assetId === asset.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return total + (history[0]?.value || 0);
  }, 0);

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  doc.setFontSize(12);
  doc.text('サマリー', 14, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.text(`総資産額: ${formatCurrency(totalAssets)}`, 20, yPosition);
  yPosition += 6;
  doc.text(`総収入: ${formatCurrency(totalIncome)} (${incomes.length}件)`, 20, yPosition);
  yPosition += 6;
  doc.text(`総支出: ${formatCurrency(totalExpense)} (${expenses.length}件)`, 20, yPosition);
  yPosition += 6;
  doc.text(`収支差額: ${formatCurrency(totalIncome - totalExpense)}`, 20, yPosition);
  yPosition += 12;

  // 資産テーブル
  const typeLabels: Record<string, string> = {
    cash: '現金・預金',
    investment: '投資',
    property: '不動産',
    other: 'その他',
  };

  const assetTableData = assets.map((asset) => {
    const history = assetHistory
      .filter((h) => h.assetId === asset.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    const latestValue = history[0]?.value || 0;

    return [
      asset.name,
      typeLabels[asset.type] || asset.type,
      formatYearMonth(asset.acquisitionDate),
      formatCurrency(latestValue),
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['資産名', '種別', '取得日', '最新評価額']],
    body: assetTableData,
    headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
    styles: { fontSize: 9, font: 'helvetica' },
    margin: { left: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ページ追加が必要な場合
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // 収入テーブル
  doc.setFontSize(12);
  doc.text('収入一覧', 14, yPosition);
  yPosition += 7;

  const incomeTableData = incomes.slice(0, 20).map((income) => [
    formatYearMonth(income.date),
    income.source,
    formatCurrency(income.amount),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['年月', '収入源', '金額']],
    body: incomeTableData,
    headStyles: { fillColor: [16, 185, 129], fontSize: 10 },
    styles: { fontSize: 9, font: 'helvetica' },
    margin: { left: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ページ追加が必要な場合
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // 支出テーブル
  doc.setFontSize(12);
  doc.text('支出一覧', 14, yPosition);
  yPosition += 7;

  const expenseTableData = expenses.slice(0, 20).map((expense) => {
    const category = expenseCategories.find((c) => c.id === expense.categoryId);
    return [
      formatYearMonth(expense.date),
      category?.name || '不明',
      formatCurrency(expense.amount),
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['年月', 'カテゴリ', '金額']],
    body: expenseTableData,
    headStyles: { fillColor: [239, 68, 68], fontSize: 10 },
    styles: { fontSize: 9, font: 'helvetica' },
    margin: { left: 14 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ページ追加が必要な場合
  if (yPosition > 250 || lifeEvents.length > 0) {
    doc.addPage();
    yPosition = 20;
  }

  // ライフイベントテーブル
  if (lifeEvents.length > 0) {
    const categoryLabels: Record<string, string> = {
      education: '教育',
      housing: '住宅',
      vehicle: '車両',
      retirement: '退職',
      other: 'その他',
    };

    doc.setFontSize(12);
    doc.text('ライフイベント', 14, yPosition);
    yPosition += 7;

    const lifeEventTableData = lifeEvents.map((event) => [
      event.name,
      formatYearMonth(event.date),
      categoryLabels[event.category] || event.category,
      formatCurrency(event.estimatedCost),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['イベント名', '発生時期', 'カテゴリ', '予想費用']],
      body: lifeEventTableData,
      headStyles: { fillColor: [139, 92, 246], fontSize: 10 },
      styles: { fontSize: 9, font: 'helvetica' },
      margin: { left: 14 },
    });
  }

  // ファイル出力
  doc.save(`LifePlanner_${new Date().toISOString().split('T')[0]}.pdf`);
}
