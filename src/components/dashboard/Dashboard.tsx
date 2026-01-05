import { AssetTable } from './AssetTable';
import { AssetChart } from './AssetChart';
import { PortfolioChart } from './PortfolioChart';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            資産ポートフォリオ管理
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            資産をスプレッド形式で編集・管理できます
          </p>
        </div>
      </div>

      {/* 編集可能な資産テーブル */}
      <div>
        <AssetTable />
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetChart />
        <PortfolioChart />
      </div>

      {/* 使い方ガイド */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">使い方</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• テーブルのセルをクリックすると、直接編集できます</li>
          <li>• 「+ 資産を追加」ボタンから新しい資産を追加できます</li>
          <li>• 評価額を更新すると、グラフにリアルタイムで反映されます</li>
          <li>• 資産タイプごとの推移と構成比を確認できます</li>
        </ul>
      </div>
    </div>
  );
}
