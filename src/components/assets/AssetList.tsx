import { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useHousehold } from '@/hooks/useHousehold';
import { formatCurrency, formatYearMonthJa } from '@/lib/utils';
import type { Asset, AssetType } from '@/types/asset';

const assetTypeLabels: Record<AssetType, string> = {
  cash: '現金・預金',
  investment: '投資',
  property: '不動産',
  insurance: '保険',
  other: 'その他',
};

const assetTypeColors: Record<AssetType, string> = {
  cash: 'bg-blue-100 text-blue-800',
  investment: 'bg-green-100 text-green-800',
  property: 'bg-purple-100 text-purple-800',
  insurance: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

interface AssetListProps {
  onEdit: (asset: Asset) => void;
  onAddHistory: (asset: Asset) => void;
}

export function AssetList({ onEdit, onAddHistory }: AssetListProps) {
  const { assets, assetHistory, deleteAsset } = useAssets();
  const { members: householdMembers } = useHousehold();
  const [filter, setFilter] = useState<AssetType | 'all'>('all');

  const filteredAssets = assets.filter((asset) => filter === 'all' || asset.type === filter);

  const getLatestValue = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);

    // 保険の場合は保険金額（coverageAmount）を資産評価額として使用
    if (asset?.type === 'insurance' && asset.coverageAmount) {
      return asset.coverageAmount;
    }

    // その他の資産は履歴から最新値を取得
    const history = assetHistory
      .filter((h) => h.assetId === assetId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return history[0]?.value || 0;
  };

  const getTotalValue = () => {
    return filteredAssets.reduce((total, asset) => total + getLatestValue(asset.id), 0);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`「${name}」を削除してもよろしいですか？`)) {
      await deleteAsset(id);
    }
  };

  return (
    <div>
      {/* フィルター */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          すべて
        </button>
        {(Object.keys(assetTypeLabels) as AssetType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {assetTypeLabels[type]}
          </button>
        ))}
      </div>

      {/* 合計金額 */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-sm font-medium opacity-90 mb-1">
          {filter === 'all' ? '総資産額' : `${assetTypeLabels[filter]}合計`}
        </h3>
        <p className="text-4xl font-bold">{formatCurrency(getTotalValue())}</p>
        <p className="text-sm opacity-75 mt-2">{filteredAssets.length}件の資産</p>
      </div>

      {/* 資産リスト */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">資産が登録されていません</p>
          <p className="text-sm text-gray-400 mt-1">右上の「資産を追加」ボタンから登録してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssets.map((asset) => {
            const latestValue = getLatestValue(asset.id);
            const historyCount = assetHistory.filter((h) => h.assetId === asset.id).length;

            return (
              <div key={asset.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${assetTypeColors[asset.type]}`}>
                        {assetTypeLabels[asset.type]}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      {formatCurrency(latestValue)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>取得日: {formatYearMonthJa(asset.acquisitionDate)}</p>
                      {asset.memo && <p className="text-gray-500">メモ: {asset.memo}</p>}

                      {/* 保険固有の情報 */}
                      {asset.type === 'insurance' && (
                        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                          {asset.coverageType && (
                            <p className="text-gray-700">
                              <span className="font-medium">保険種別:</span> {asset.coverageType}
                            </p>
                          )}
                          {asset.monthlyPremium && (
                            <p className="text-gray-700">
                              <span className="font-medium">月額保険料:</span> {formatCurrency(asset.monthlyPremium)}
                            </p>
                          )}
                          {asset.paymentEndAge && (
                            <p className="text-gray-700">
                              <span className="font-medium">支払い終了年齢:</span> {asset.paymentEndAge}歳
                            </p>
                          )}
                          {asset.coverageAmount && (
                            <p className="text-gray-700">
                              <span className="font-medium">保険金額:</span> {formatCurrency(asset.coverageAmount)}
                            </p>
                          )}
                          {asset.linkedMemberId && (
                            <p className="text-gray-700">
                              <span className="font-medium">加入者:</span>{' '}
                              {householdMembers.find((m) => m.id === asset.linkedMemberId)?.name || '不明'}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-gray-400">履歴: {historyCount}件</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => onAddHistory(asset)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                    >
                      履歴追加
                    </button>
                    <button
                      onClick={() => onEdit(asset)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id, asset.name)}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
