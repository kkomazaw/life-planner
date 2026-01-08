import { useMemo, useCallback, memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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

interface PortfolioChartProps {
  selectedDate: string | null;
}

export const PortfolioChart = memo(function PortfolioChart({ selectedDate }: PortfolioChartProps) {
  const { assets, assetHistory } = useAssets();

  // 各資産の評価額を取得（評価日フィルター適用）
  const getValueAtDate = useCallback((assetId: string): number => {
    const asset = assets.find((a) => a.id === assetId);

    // 保険の場合は保険金額を返す
    if (asset?.type === 'insurance' && asset.coverageAmount) {
      return asset.coverageAmount;
    }

    let history = assetHistory.filter((h) => h.assetId === assetId);

    // 評価日が選択されている場合、その日以前のデータのみに絞る
    if (selectedDate) {
      history = history.filter(
        (h) => h.date.toISOString().slice(0, 10) <= selectedDate
      );
    }

    // 最新の履歴を取得
    const sorted = history.sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted[0]?.value || 0;
  }, [assets, assetHistory, selectedDate]);

  // 資産タイプごとの構成データを作成
  const chartData = useMemo(() => {
    const byType: Record<AssetType, number> = {
      cash: 0,
      investment: 0,
      property: 0,
      insurance: 0,
      other: 0,
    };

    assets.forEach((asset) => {
      const value = getValueAtDate(asset.id);
      byType[asset.type] += value;
    });

    return (Object.entries(byType) as [AssetType, number][])
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        name: assetTypeLabels[type],
        value,
        type,
      }));
  }, [assets, assetHistory, selectedDate]);

  const totalAssets = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500">データがありません</p>
        <p className="text-sm text-slate-400 mt-2">
          資産を追加すると、ここに構成グラフが表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        資産構成
        {selectedDate && (
          <span className="text-sm font-normal text-slate-600 ml-2">
            ({new Date(selectedDate).toLocaleDateString('ja-JP')}時点)
          </span>
        )}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={assetTypeColors[entry.type]} />
            ))}
          </Pie>
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
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 詳細リスト */}
      <div className="mt-6 space-y-3">
        {chartData.map((item) => (
          <div key={item.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: assetTypeColors[item.type] }}
              />
              <span className="text-sm font-medium text-slate-700">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                {formatCurrency(item.value)}
              </div>
              <div className="text-xs text-slate-500">
                {((item.value / totalAssets) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
