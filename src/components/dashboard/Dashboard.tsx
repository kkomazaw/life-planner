import { useState, useMemo } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { AssetTable } from './AssetTable';
import { AssetChart } from './AssetChart';
import { PortfolioChart } from './PortfolioChart';

export function Dashboard() {
  const { assetHistory } = useAssets();

  // 評価日のユニークなリストを取得（降順）
  const availableDates = useMemo(() => {
    const dates = Array.from(
      new Set(assetHistory.map((h) => h.date.toISOString().slice(0, 10)))
    ).sort((a, b) => b.localeCompare(a));
    return dates;
  }, [assetHistory]);

  // 最新の評価日をデフォルトに設定
  const [selectedDate, setSelectedDate] = useState<string | null>(
    availableDates.length > 0 ? availableDates[0] : null
  );

  // selectedDateが変更されたら、availableDatesの最新に更新
  useMemo(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            資産ポートフォリオ管理
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            資産をスプレッド形式で編集・管理できます
          </p>
        </div>

        {/* 評価日フィルター */}
        {availableDates.length > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor="date-filter" className="text-sm font-medium text-slate-700">
              表示する評価日:
            </label>
            <select
              id="date-filter"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-modern py-2 px-3 text-sm min-w-[160px]"
            >
              <option value="">全期間</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 編集可能な資産テーブル */}
      <div>
        <AssetTable />
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetChart selectedDate={selectedDate} />
        <PortfolioChart selectedDate={selectedDate} />
      </div>

      {/* 使い方ガイド */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">使い方</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• テーブルのセルをクリックすると、直接編集できます</li>
          <li>• 評価日をクリックして日付を変更できます</li>
          <li>• 「+ 資産を追加」ボタンから新しい資産を追加できます</li>
          <li>• 評価日フィルターでグラフに表示するデータを切り替えられます</li>
          <li>• 資産タイプごとの推移と構成比を確認できます</li>
        </ul>
      </div>
    </div>
  );
}
