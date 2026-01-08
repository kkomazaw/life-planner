import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import {
  parseCSVFile,
  parseExcelFile,
  importAssets,
  importIncomes,
  importExpenses,
  importLifeEvents,
  validateImportData,
  type ImportResult,
} from '@/lib/import';

type ImportType = 'assets' | 'incomes' | 'expenses' | 'lifeEvents';

export function DataImport() {
  const { createAsset } = useAssets();
  const { incomes, expenses, expenseCategories, createIncome, createExpense } = useTransactions();
  const { createLifeEvent } = useLifeEvents();

  const [importType, setImportType] = useState<ImportType>('assets');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('ファイルを選択してください');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      let data: any[][];

      // ファイル形式に応じて解析
      if (file.name.endsWith('.csv')) {
        data = await parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const sheets = await parseExcelFile(file);
        // 最初のシートを使用（または型に応じてシート名で選択）
        const sheetNames = Object.keys(sheets);
        data = sheets[sheetNames[0]] || [];
      } else {
        throw new Error('サポートされていないファイル形式です（CSV または Excel のみ）');
      }

      // データの検証
      const validation = validateImportData(importType, data);
      if (!validation.valid) {
        setResult({
          success: false,
          message: '検証エラー',
          errors: validation.errors,
        });
        return;
      }

      // データのインポート処理
      let importResult: ImportResult;

      switch (importType) {
        case 'assets':
          importResult = importAssets(data);
          if (importResult.success && importResult.data?.assets) {
            // データベースに保存
            for (const asset of importResult.data.assets) {
              await createAsset({
                name: asset.name!,
                type: asset.type!,
                acquisitionDate: asset.acquisitionDate!,
                memo: asset.memo,
              });
            }
          }
          break;

        case 'incomes':
          importResult = importIncomes(data);
          if (importResult.success && importResult.data?.incomes) {
            for (const income of importResult.data.incomes) {
              await createIncome({
                date: income.date!,
                source: income.source!,
                amount: income.amount!,
                memo: income.memo,
              });
            }
          }
          break;

        case 'expenses':
          importResult = importExpenses(data, expenseCategories);
          if (importResult.success && importResult.data?.expenses) {
            for (const expense of importResult.data.expenses) {
              await createExpense({
                date: expense.date!,
                categoryId: expense.categoryId!,
                amount: expense.amount!,
                memo: expense.memo,
              });
            }
          }
          break;

        case 'lifeEvents':
          importResult = importLifeEvents(data);
          if (importResult.success && importResult.data?.lifeEvents) {
            for (const event of importResult.data.lifeEvents) {
              await createLifeEvent({
                name: event.name!,
                date: event.date!,
                category: event.category!,
                estimatedCost: event.estimatedCost!,
                memo: event.memo,
              });
            }
          }
          break;

        default:
          throw new Error('不明なインポート種別です');
      }

      setResult(importResult);
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'インポートに失敗しました',
        errors: [error instanceof Error ? error.message : '不明なエラー'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const importTypeLabels: Record<ImportType, string> = {
    assets: '資産',
    incomes: '収入',
    expenses: '支出',
    lifeEvents: 'ライフイベント',
  };

  const importTemplates: Record<ImportType, string> = {
    assets: '資産名, 種別, 取得日, 最新評価額, メモ',
    incomes: '年月, 収入源, 金額, メモ',
    expenses: '年月, カテゴリ, 金額, メモ',
    lifeEvents: 'イベント名, 発生時期, カテゴリ, 予想費用, メモ',
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">データインポート</h2>
        <p className="text-sm text-slate-600 mt-1">
          CSV または Excel ファイルからデータをインポートできます
        </p>
      </div>

      {/* インポート種別の選択 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          インポートするデータ種別
        </label>
        <select
          value={importType}
          onChange={(e) => {
            setImportType(e.target.value as ImportType);
            setFile(null);
            setResult(null);
          }}
          className="input-modern"
        >
          {Object.entries(importTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* フォーマット情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">必要な列</h3>
        <code className="text-xs text-blue-800 break-all">
          {importTemplates[importType]}
        </code>
        <p className="text-xs text-blue-700 mt-2">
          ※ 1行目はヘッダー行として扱われます
        </p>
      </div>

      {/* ファイル選択 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          ファイルを選択
        </label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
        {file && (
          <p className="text-sm text-slate-600 mt-2">
            選択中: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* インポート実行ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={!file || isProcessing}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'インポート中...' : 'インポート実行'}
        </button>
      </div>

      {/* 結果表示 */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              result.success ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {result.success ? '✓ 成功' : '✗ エラー'}
          </h3>
          <p
            className={`text-sm ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {result.message}
          </p>
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
              {result.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-900 mb-2">注意事項</h3>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• インポートしたデータは既存のデータに追加されます</li>
          <li>• 重複チェックは行われないため、同じデータを複数回インポートしないでください</li>
          <li>• 支出をインポートする場合、事前にカテゴリを作成しておく必要があります</li>
          <li>• 大量のデータをインポートする場合、処理に時間がかかることがあります</li>
        </ul>
      </div>
    </div>
  );
}
