import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatYearMonthJa } from '@/lib/utils';
import type { Asset, AssetHistory, AssetType } from '@/types/asset';

interface AssetChartProps {
  assets: Asset[];
  assetHistory: AssetHistory[];
}

const assetTypeColors: Record<AssetType, string> = {
  cash: '#3b82f6', // blue
  investment: '#10b981', // green
  property: '#8b5cf6', // purple
  other: '#6b7280', // gray
};

export function AssetChart({ assets, assetHistory }: AssetChartProps) {
  // 月次データを集計
  const chartData = useMemo(() => {
    // すべての日付を取得してソート
    const allDates = Array.from(
      new Set(assetHistory.map((h) => h.date.getTime()))
    ).sort((a, b) => a - b);

    return allDates.map((timestamp) => {
      const date = new Date(timestamp);

      // その日付における各資産種別の合計を計算
      const totals: Record<AssetType, number> = {
        cash: 0,
        investment: 0,
        property: 0,
        other: 0,
      };

      assets.forEach((asset) => {
        // この資産のこの日付の履歴を探す
        const history = assetHistory.find(
          (h) => h.assetId === asset.id && h.date.getTime() === timestamp
        );

        if (history) {
          totals[asset.type] += history.value;
        }
      });

      const total = totals.cash + totals.investment + totals.property + totals.other;

      return {
        date: formatYearMonthJa(date),
        dateObj: date,
        総資産: total,
        現金・預金: totals.cash,
        投資: totals.investment,
        不動産: totals.property,
        その他: totals.other,
      };
    });
  }, [assets, assetHistory]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
        <p className="text-gray-500">資産履歴データがありません</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
          />
          <Tooltip
            formatter={(value) => `¥${Number(value || 0).toLocaleString()}`}
            labelStyle={{ color: '#1f2937' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="総資産"
            stroke="#1f2937"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="現金・預金"
            stroke={assetTypeColors.cash}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="投資"
            stroke={assetTypeColors.investment}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="不動産"
            stroke={assetTypeColors.property}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="その他"
            stroke={assetTypeColors.other}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
