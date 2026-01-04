import { useState, useEffect } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { formatYearMonth } from '@/lib/utils';
import type { Asset, AssetType } from '@/types/asset';

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: 'cash', label: '現金・預金' },
  { value: 'investment', label: '投資' },
  { value: 'property', label: '不動産' },
  { value: 'other', label: 'その他' },
];

interface AssetFormProps {
  asset?: Asset;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssetForm({ asset, onClose, onSuccess }: AssetFormProps) {
  const { createAsset, updateAsset } = useAssets();
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('cash');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!asset;

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setType(asset.type);
      setAcquisitionDate(formatYearMonth(asset.acquisitionDate));
      setMemo(asset.memo || '');
    } else {
      // デフォルトは今月
      const now = new Date();
      setAcquisitionDate(formatYearMonth(now));
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('資産名を入力してください');
      return;
    }

    if (!acquisitionDate) {
      setError('取得日を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const [year, month] = acquisitionDate.split('-').map(Number);
      const date = new Date(year, month - 1, 1);

      if (isEdit && asset) {
        await updateAsset(asset.id, {
          name: name.trim(),
          type,
          acquisitionDate: date,
          memo: memo.trim() || undefined,
        });
      } else {
        await createAsset({
          name: name.trim(),
          type,
          acquisitionDate: date,
          memo: memo.trim() || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('保存に失敗しました');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? '資産を編集' : '資産を追加'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              資産名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 三菱UFJ銀行 普通預金"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              資産種別 <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">
              取得年月 <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              id="acquisitionDate"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="メモを入力"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : isEdit ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
