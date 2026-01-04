import { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { formatYearMonth, formatCurrency, formatYearMonthJa, getEndOfMonth } from '@/lib/utils';
import type { Asset } from '@/types/asset';

interface AssetHistoryFormProps {
  asset: Asset;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssetHistoryForm({ asset, onClose, onSuccess }: AssetHistoryFormProps) {
  const { createAssetHistory, getAssetHistory, deleteAssetHistory } = useAssets();
  const [date, setDate] = useState(() => {
    const now = new Date();
    return formatYearMonth(now);
  });
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const history = getAssetHistory(asset.id).slice(0, 10); // 直近10件

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('日付を入力してください');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setError('正しい金額を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const [year, month] = date.split('-').map(Number);
      const monthEndDate = getEndOfMonth(new Date(year, month - 1, 1));

      await createAssetHistory({
        assetId: asset.id,
        date: monthEndDate,
        value: numValue,
      });

      setValue('');
      onSuccess();
    } catch (err) {
      setError('保存に失敗しました');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('この履歴を削除してもよろしいですか？')) {
      await deleteAssetHistory(id);
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          評価額履歴を追加
        </h2>
        <p className="text-gray-600 mb-6">{asset.name}</p>

        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                年月 <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                評価額 (円) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000000"
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '追加中...' : '追加'}
            </button>
          </div>
        </form>

        {/* 履歴一覧 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">履歴 (直近10件)</h3>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">履歴がありません</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(h.value)}</p>
                    <p className="text-sm text-gray-600">{formatYearMonthJa(h.date)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
