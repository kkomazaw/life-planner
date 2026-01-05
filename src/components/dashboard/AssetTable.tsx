import { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { formatCurrency } from '@/lib/utils';
import type { Asset, AssetType, AssetHistory } from '@/types/asset';

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: 'cash', label: '現金・預金' },
  { value: 'investment', label: '投資' },
  { value: 'property', label: '不動産' },
  { value: 'other', label: 'その他' },
];

export function AssetTable() {
  const { assets, assetHistory, createAsset, updateAsset, deleteAsset, createAssetHistory, updateAssetHistory, deleteAssetHistory } = useAssets();
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'cash' as AssetType,
    value: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // 各資産の最新評価履歴を取得
  const getLatestHistory = (assetId: string): AssetHistory | null => {
    const history = assetHistory
      .filter((h) => h.assetId === assetId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return history[0] || null;
  };

  // セルの編集開始
  const startEditing = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  // セルの編集完了（資産情報）
  const finishEditingAsset = async (assetId: string) => {
    if (!editingCell) return;

    const { field } = editingCell;

    try {
      if (field === 'name') {
        await updateAsset(assetId, { name: editValue });
      } else if (field === 'type') {
        await updateAsset(assetId, { type: editValue as AssetType });
      }
    } catch (error) {
      console.error('Failed to update asset:', error);
    }

    setEditingCell(null);
    setEditValue('');
  };

  // セルの編集完了（評価履歴）
  const finishEditingHistory = async (historyId: string) => {
    if (!editingCell) return;

    const { field } = editingCell;
    const history = assetHistory.find((h) => h.id === historyId);
    if (!history) return;

    try {
      if (field === 'date') {
        await updateAssetHistory(historyId, { date: new Date(editValue) });
      } else if (field === 'value') {
        const value = parseFloat(editValue.replace(/,/g, ''));
        if (!isNaN(value)) {
          await updateAssetHistory(historyId, { value });
        }
      }
    } catch (error) {
      console.error('Failed to update asset history:', error);
    }

    setEditingCell(null);
    setEditValue('');
  };

  // 新規資産の追加
  const handleAddAsset = async () => {
    if (!newAsset.name.trim()) return;

    try {
      const value = parseFloat(newAsset.value.replace(/,/g, '')) || 0;
      const asset = await createAsset({
        name: newAsset.name,
        type: newAsset.type,
        acquisitionDate: new Date(),
      });

      if (value > 0) {
        await createAssetHistory({
          assetId: asset.id,
          date: new Date(newAsset.date),
          value,
        });
      }

      setNewAsset({ name: '', type: 'cash', value: '', date: new Date().toISOString().slice(0, 10) });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  // 資産の削除
  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm('この資産を削除してもよろしいですか？')) {
      try {
        await deleteAsset(assetId);
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  // 評価履歴の削除
  const handleDeleteHistory = async (historyId: string) => {
    if (window.confirm('この評価履歴を削除してもよろしいですか？')) {
      try {
        await deleteAssetHistory(historyId);
      } catch (error) {
        console.error('Failed to delete asset history:', error);
      }
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                資産名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                種別
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                評価日
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                評価額
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider w-20">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {assets.map((asset) => {
              const latestHistory = getLatestHistory(asset.id);
              const typeOption = assetTypeOptions.find((opt) => opt.value === asset.type);

              return (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {editingCell?.id === asset.id && editingCell?.field === 'name' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => finishEditingAsset(asset.id)}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditingAsset(asset.id)}
                        autoFocus
                        className="input-modern py-1 text-sm"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(asset.id, 'name', asset.name)}
                        className="cursor-pointer text-sm font-medium text-slate-900 hover:text-blue-600 py-1"
                      >
                        {asset.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.id === asset.id && editingCell?.field === 'type' ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => finishEditingAsset(asset.id)}
                        autoFocus
                        className="input-modern py-1 text-sm"
                      >
                        {assetTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        onClick={() => startEditing(asset.id, 'type', asset.type)}
                        className="cursor-pointer text-sm text-slate-600 hover:text-blue-600 py-1"
                      >
                        {typeOption?.label}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {latestHistory ? (
                      editingCell?.id === latestHistory.id && editingCell?.field === 'date' ? (
                        <input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => finishEditingHistory(latestHistory.id)}
                          onKeyDown={(e) => e.key === 'Enter' && finishEditingHistory(latestHistory.id)}
                          autoFocus
                          className="input-modern py-1 text-sm"
                        />
                      ) : (
                        <div
                          onClick={() => startEditing(latestHistory.id, 'date', latestHistory.date.toISOString().slice(0, 10))}
                          className="cursor-pointer text-sm text-slate-600 hover:text-blue-600 py-1"
                        >
                          {latestHistory.date.toLocaleDateString('ja-JP')}
                        </div>
                      )
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {latestHistory ? (
                      editingCell?.id === latestHistory.id && editingCell?.field === 'value' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => finishEditingHistory(latestHistory.id)}
                          onKeyDown={(e) => e.key === 'Enter' && finishEditingHistory(latestHistory.id)}
                          autoFocus
                          className="input-modern py-1 text-sm text-right"
                        />
                      ) : (
                        <div
                          onClick={() => startEditing(latestHistory.id, 'value', latestHistory.value.toString())}
                          className="cursor-pointer text-sm font-semibold text-slate-900 hover:text-blue-600 py-1"
                        >
                          {formatCurrency(latestHistory.value)}
                        </div>
                      )
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors text-sm"
                      title="削除"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* 新規追加行 */}
            {isAddingNew ? (
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAsset()}
                    placeholder="資産名を入力"
                    autoFocus
                    className="input-modern py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as AssetType })}
                    className="input-modern py-1 text-sm"
                  >
                    {assetTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={newAsset.date}
                    onChange={(e) => setNewAsset({ ...newAsset, date: e.target.value })}
                    className="input-modern py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newAsset.value}
                    onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAsset()}
                    placeholder="0"
                    className="input-modern py-1 text-sm text-right"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={handleAddAsset}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-2"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewAsset({ name: '', type: 'cash', value: '', date: new Date().toISOString().slice(0, 10) });
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ) : (
              <tr className="bg-slate-50">
                <td colSpan={5} className="px-4 py-3">
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + 資産を追加
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 合計行 */}
      <div className="border-t-2 border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">総資産額</span>
          <span className="text-lg font-bold text-slate-900">
            {formatCurrency(
              assets.reduce((total, asset) => {
                const history = getLatestHistory(asset.id);
                return total + (history?.value || 0);
              }, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
