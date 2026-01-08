import { useMemo, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAssets } from '@/hooks/useAssets';
import { formatCurrency } from '@/lib/utils';
import type { AssetType } from '@/types/asset';

const assetTypeColors: Record<AssetType, string> = {
  cash: '#3b82f6',
  investment: '#10b981',
  property: '#8b5cf6',
  insurance: '#f59e0b',
  other: '#64748b',
};

const assetTypeLabels: Record<AssetType, string> = {
  cash: '現金・預金',
  investment: '投資',
  property: '不動産',
  insurance: '保険',
  other: 'その他',
};

interface AssetChartProps {
  selectedDate: string | null;
}

export const AssetChart = memo(function AssetChart({ selectedDate }: AssetChartProps) {
  const { assets, assetHistory } = useAssets();

  // 月ごとの資産推移データを作成
  const chartData = useMemo(() => {
    if (assetHistory.length === 0) return [];

    // フィルター適用: 特定の評価日が選択されている場合
    let filteredHistory = assetHistory;
    if (selectedDate) {
      filteredHistory = assetHistory.filter(
        (h) => h.date.toISOString().slice(0, 10) <= selectedDate
      );
    }

    if (filteredHistory.length === 0) return [];

    // 全ての日付を取得してソート
    const allDates = Array.from(
      new Set(filteredHistory.map((h) => h.date.toISOString().slice(0, 7)))
    ).sort();

    // 各月のデータを作成
    return allDates.map((monthStr) => {
      const dataPoint: any = {
        month: monthStr,
        monthLabel: new Date(monthStr + '-01').toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
        }),
      };

      let total = 0;

      // 資産タイプごとの合計を計算
      const byType: Record<AssetType, number> = {
        cash: 0,
        investment: 0,
        property: 0,
        insurance: 0,
        other: 0,
      };

      assets.forEach((asset) => {
        // 該当月の履歴を取得（選択された評価日以前のデータのみ）
        const history = filteredHistory
          .filter((h) => h.assetId === asset.id)
          .filter((h) => h.date.toISOString().slice(0, 7) === monthStr)
          .sort((a, b) => b.date.getTime() - a.date.getTime());

        const value = history[0]?.value || 0;
        byType[asset.type] += value;
        total += value;
      });

      dataPoint.total = total;
      dataPoint.cash = byType.cash;
      dataPoint.investment = byType.investment;
      dataPoint.property = byType.property;
      dataPoint.insurance = byType.insurance;
      dataPoint.other = byType.other;

      return dataPoint;
    });
  }, [assets, assetHistory, selectedDate]);

  // どの資産タイプが存在するかをチェック
  const hasAssetType = useMemo(() => {
    const types: Record<AssetType, boolean> = {
      cash: false,
      investment: false,
      property: false,
      insurance: false,
      other: false,
    };

    assets.forEach((asset) => {
      types[asset.type] = true;
    });

    return types;
  }, [assets]);

  if (chartData.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500">データがありません</p>
        <p className="text-sm text-slate-400 mt-2">
          資産を追加すると、ここに推移グラフが表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        資産推移
        {selectedDate && (
          <span className="text-sm font-normal text-slate-600 ml-2">
            ({new Date(selectedDate).toLocaleDateString('ja-JP')}時点)
          </span>
        )}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 12, fill: '#64748b' }}
            stroke="#cbd5e1"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            stroke="#cbd5e1"
            tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#1e293b"
            strokeWidth={2}
            name="総資産"
            dot={{ fill: '#1e293b', r: 4 }}
            activeDot={{ r: 6 }}
          />
          {hasAssetType.cash && (
            <Line
              type="monotone"
              dataKey="cash"
              stroke={assetTypeColors.cash}
              strokeWidth={2}
              name={assetTypeLabels.cash}
              dot={{ fill: assetTypeColors.cash, r: 3 }}
            />
          )}
          {hasAssetType.investment && (
            <Line
              type="monotone"
              dataKey="investment"
              stroke={assetTypeColors.investment}
              strokeWidth={2}
              name={assetTypeLabels.investment}
              dot={{ fill: assetTypeColors.investment, r: 3 }}
            />
          )}
          {hasAssetType.property && (
            <Line
              type="monotone"
              dataKey="property"
              stroke={assetTypeColors.property}
              strokeWidth={2}
              name={assetTypeLabels.property}
              dot={{ fill: assetTypeColors.property, r: 3 }}
            />
          )}
          {hasAssetType.other && (
            <Line
              type="monotone"
              dataKey="other"
              stroke={assetTypeColors.other}
              strokeWidth={2}
              name={assetTypeLabels.other}
              dot={{ fill: assetTypeColors.other, r: 3 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
