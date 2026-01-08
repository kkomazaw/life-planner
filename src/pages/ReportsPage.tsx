import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { AssetChart } from '@/components/reports/AssetChart';
import { IncomeExpenseChart } from '@/components/reports/IncomeExpenseChart';
import { AssetCompositionChart } from '@/components/reports/AssetCompositionChart';
import { formatCurrency } from '@/lib/utils';
import { exportAllToExcel, exportAllToCSV, exportAllToPDF } from '@/lib/export';

export function ReportsPage() {
  const { assets, assetHistory } = useAssets();
  const { incomes, expenses, expenseCategories } = useTransactions();
  const { lifeEvents } = useLifeEvents();

  // 簡易統計
  const totalAssets = assets.reduce((total, asset) => {
    const history = assetHistory
      .filter((h) => h.assetId === asset.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return total + (history[0]?.value || 0);
  }, 0);

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleExportExcel = () => {
    try {
      exportAllToExcel(assets, assetHistory, incomes, expenses, expenseCategories, lifeEvents);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Excelファイルの出力に失敗しました');
    }
  };

  const handleExportCSV = () => {
    try {
      exportAllToCSV(assets, assetHistory, incomes, expenses, expenseCategories, lifeEvents);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSVファイルの出力に失敗しました');
    }
  };

  const handleExportPDF = () => {
    try {
      exportAllToPDF(assets, assetHistory, incomes, expenses, expenseCategories, lifeEvents);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDFファイルの出力に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">レポート</h1>
          <p className="text-sm text-slate-600 mt-1">
            資産・収支の統計とエクスポート
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            PDF
          </button>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90 mb-1">総資産額</p>
          <p className="text-2xl font-bold">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">総収入</p>
          <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
          <p className="text-sm opacity-75 mt-2">{incomes.length}件</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90 mb-1">総支出</p>
          <p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p>
          <p className="text-sm opacity-75 mt-2">{expenses.length}件</p>
        </div>
      </div>

      {/* グラフ */}
      <div className="space-y-6">
        {/* 資産推移グラフ */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">資産推移</h2>
          <AssetChart assets={assets} assetHistory={assetHistory} />
        </div>

        {/* 収支グラフ */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">月次収支</h2>
          <IncomeExpenseChart incomes={incomes} expenses={expenses} />
        </div>

        {/* 資産構成グラフ */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">資産構成</h2>
          <AssetCompositionChart assets={assets} assetHistory={assetHistory} />
        </div>
      </div>
    </div>
  );
}
