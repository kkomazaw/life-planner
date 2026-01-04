import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { AssetChart } from '@/components/reports/AssetChart';
import { IncomeExpenseChart } from '@/components/reports/IncomeExpenseChart';
import { AssetCompositionChart } from '@/components/reports/AssetCompositionChart';
import { formatCurrency } from '@/lib/utils';
import { exportAllToExcel } from '@/lib/export';

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">レポート</h1>
        <button
          onClick={handleExportExcel}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Excelファイルをダウンロード
        </button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">総資産額</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">総収入</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
          <p className="text-sm opacity-75 mt-2">{incomes.length}件</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-1">総支出</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalExpense)}</p>
          <p className="text-sm opacity-75 mt-2">{expenses.length}件</p>
        </div>
      </div>

      {/* グラフ */}
      <div className="space-y-6">
        {/* 資産推移グラフ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">資産推移</h2>
          <AssetChart assets={assets} assetHistory={assetHistory} />
        </div>

        {/* 収支グラフ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">月次収支</h2>
          <IncomeExpenseChart incomes={incomes} expenses={expenses} />
        </div>

        {/* 資産構成グラフ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">資産構成</h2>
          <AssetCompositionChart assets={assets} assetHistory={assetHistory} />
        </div>
      </div>
    </div>
  );
}
