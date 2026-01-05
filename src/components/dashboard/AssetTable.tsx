import { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { formatCurrency } from '@/lib/utils';
import type { Asset, AssetType } from '@/types/asset';

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: 'cash', label: '現金・預金' },
  { value: 'investment', label: '投資' },
  { value: 'property', label: '不動産' },
  { value: 'other', label: 'その他' },
];

export function AssetTable() {
  const { assets, assetHistory, createAsset, updateAsset, deleteAsset, createAssetHistory } = useAssets();
  const [editingCell, setEditingCell] = useState<{ assetId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'cash' as AssetType,
    value: '',
  });

  // 各資産の最新評価額を取得
  const getLatestValue = (assetId: string): number => {
    const history = assetHistory
      .filter((h) => h.assetId === assetId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return history[0]?.value || 0;
  };

  // セルの編集開始
  const startEditing = (assetId: string, field: string, currentValue: string) => {
    setEditingCell({ assetId, field });
    setEditValue(currentValue);
  };

  // セルの編集完了
  const finishEditing = async () => {
    if (!editingCell) return;

    const { assetId, field } = editingCell;
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    try {
      if (field === 'name') {
        await updateAsset(assetId, { name: editValue });
      } else if (field === 'type') {
        await updateAsset(assetId, { type: editValue as AssetType });
      } else if (field === 'value') {
        const value = parseFloat(editValue.replace(/,/g, ''));
        if (!isNaN(value)) {
          const now = new Date();
          const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          await createAssetHistory({
            assetId,
            date: lastDayOfMonth,
            value,
          });
        }
      }
    } catch (error) {
      console.error('Failed to update asset:', error);
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
        const now = new Date();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        await createAssetHistory({
          assetId: asset.id,
          date: lastDayOfMonth,
          value,
        });
      }

      setNewAsset({ name: '', type: 'cash', value: '' });
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
              const latestValue = getLatestValue(asset.id);
              const typeOption = assetTypeOptions.find((opt) => opt.value === asset.type);

              return (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {editingCell?.assetId === asset.id && editingCell?.field === 'name' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
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
                    {editingCell?.assetId === asset.id && editingCell?.field === 'type' ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
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
                  <td className="px-4 py-3 text-right">
                    {editingCell?.assetId === asset.id && editingCell?.field === 'value' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                        autoFocus
                        className="input-modern py-1 text-sm text-right"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(asset.id, 'value', latestValue.toString())}
                        className="cursor-pointer text-sm font-semibold text-slate-900 hover:text-blue-600 py-1"
                      >
                        {formatCurrency(latestValue)}
                      </div>
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
                      setNewAsset({ name: '', type: 'cash', value: '' });
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ) : (
              <tr className="bg-slate-50">
                <td colSpan={4} className="px-4 py-3">
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
            {formatCurrency(assets.reduce((total, asset) => total + getLatestValue(asset.id), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
