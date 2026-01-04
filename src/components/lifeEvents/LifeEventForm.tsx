import { useState, useEffect } from 'react';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { formatYearMonth } from '@/lib/utils';
import type { LifeEvent, LifeEventCategory } from '@/types/lifeEvent';

interface LifeEventFormProps {
  lifeEvent?: LifeEvent;
  onClose: () => void;
  onSuccess: () => void;
}

const categoryLabels: Record<LifeEventCategory, string> = {
  education: '教育',
  housing: '住宅',
  vehicle: '車両',
  retirement: '退職',
  other: 'その他',
};

export function LifeEventForm({ lifeEvent, onClose, onSuccess }: LifeEventFormProps) {
  const { createLifeEvent, updateLifeEvent } = useLifeEvents();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<LifeEventCategory>('other');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!lifeEvent;

  useEffect(() => {
    if (lifeEvent) {
      setName(lifeEvent.name);
      setDate(formatYearMonth(lifeEvent.date));
      setCategory(lifeEvent.category);
      setEstimatedCost(lifeEvent.estimatedCost.toString());
      setMemo(lifeEvent.memo || '');
    } else {
      const now = new Date();
      setDate(formatYearMonth(now));
    }
  }, [lifeEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('イベント名を入力してください');
      return;
    }

    if (!date) {
      setError('発生時期を入力してください');
      return;
    }

    const cost = parseFloat(estimatedCost);
    if (isNaN(cost) || cost < 0) {
      setError('正しい予想費用を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const [year, month] = date.split('-').map(Number);
      const eventDate = new Date(year, month - 1, 1);

      if (isEdit && lifeEvent) {
        await updateLifeEvent(lifeEvent.id, {
          name: name.trim(),
          date: eventDate,
          category,
          estimatedCost: cost,
          memo: memo.trim() || undefined,
        });
      } else {
        await createLifeEvent({
          name: name.trim(),
          date: eventDate,
          category,
          estimatedCost: cost,
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
          {isEdit ? 'ライフイベントを編集' : 'ライフイベントを登録'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              イベント名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 子供の大学入学、住宅購入"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              発生時期 <span className="text-red-500">*</span>
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as LifeEventCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700 mb-1">
              予想費用 (円) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="estimatedCost"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
              min="0"
              step="1000"
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
