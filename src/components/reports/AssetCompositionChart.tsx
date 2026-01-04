import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Asset, AssetHistory, AssetType } from '@/types/asset';

interface AssetCompositionChartProps {
  assets: Asset[];
  assetHistory: AssetHistory[];
}

const COLORS: Record<AssetType, string> = {
  cash: '#3b82f6', // blue
  investment: '#10b981', // green
  property: '#8b5cf6', // purple
  other: '#6b7280', // gray
};

const assetTypeLabels: Record<AssetType, string> = {
  cash: '現金・預金',
  investment: '投資',
  property: '不動産',
  other: 'その他',
};

export function AssetCompositionChart({ assets, assetHistory }: AssetCompositionChartProps) {
  // 現在の資産構成を計算
  const chartData = useMemo(() => {
    const totals: Record<AssetType, number> = {
      cash: 0,
      investment: 0,
      property: 0,
      other: 0,
    };

    assets.forEach((asset) => {
      // 各資産の最新の評価額を取得
      const history = assetHistory
        .filter((h) => h.assetId === asset.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      const latestValue = history[0]?.value || 0;
      totals[asset.type] += latestValue;
    });

    // 円グラフ用のデータ形式に変換
    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        name: assetTypeLabels[type as AssetType],
        value,
        type: type as AssetType,
      }))
      .sort((a, b) => b.value - a.value);
  }, [assets, assetHistory]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
        <p className="text-gray-500">資産データがありません</p>
      </div>
    );
  }

  const totalAssets = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => {
              const percent = ((entry.value / totalAssets) * 100).toFixed(1);
              return `${entry.name} (${percent}%)`;
            }}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `¥${value.toLocaleString()}`,
              '金額',
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
