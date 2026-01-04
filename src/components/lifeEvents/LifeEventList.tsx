import { useMemo, useState } from 'react';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { formatCurrency, formatYearMonthJa } from '@/lib/utils';
import type { LifeEvent, LifeEventCategory } from '@/types/lifeEvent';

interface LifeEventListProps {
  onEdit: (lifeEvent: LifeEvent) => void;
}

const categoryLabels: Record<LifeEventCategory, string> = {
  education: '教育',
  housing: '住宅',
  vehicle: '車両',
  retirement: '退職',
  other: 'その他',
};

const categoryColors: Record<LifeEventCategory, string> = {
  education: 'bg-blue-100 text-blue-800',
  housing: 'bg-green-100 text-green-800',
  vehicle: 'bg-yellow-100 text-yellow-800',
  retirement: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

export function LifeEventList({ onEdit }: LifeEventListProps) {
  const { lifeEvents, deleteLifeEvent } = useLifeEvents();
  const [filter, setFilter] = useState<LifeEventCategory | 'all'>('all');

  // フィルタリングとソート
  const filteredEvents = useMemo(() => {
    const filtered =
      filter === 'all'
        ? lifeEvents
        : lifeEvents.filter((event) => event.category === filter);

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [lifeEvents, filter]);

  // 今後のイベントと過去のイベントに分類
  const now = new Date();
  const futureEvents = filteredEvents.filter((event) => event.date >= now);
  const pastEvents = filteredEvents.filter((event) => event.date < now);

  // 合計費用
  const totalCost = filteredEvents.reduce((sum, event) => sum + event.estimatedCost, 0);

  const handleDelete = async (id: string) => {
    if (confirm('このライフイベントを削除してもよろしいですか？')) {
      await deleteLifeEvent(id);
    }
  };

  const renderEventCard = (event: LifeEvent) => (
    <div
      key={event.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded ${categoryColors[event.category]}`}
            >
              {categoryLabels[event.category]}
            </span>
            <span className="text-sm text-gray-500">{formatYearMonthJa(event.date)}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
          <p className="text-xl font-bold text-blue-600 mb-2">
            {formatCurrency(event.estimatedCost)}
          </p>
          {event.memo && <p className="text-sm text-gray-600">{event.memo}</p>}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(event)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            編集
          </button>
          <button
            onClick={() => handleDelete(event.id)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* フィルタとサマリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリでフィルタ
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LifeEventCategory | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">合計予想費用</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
            <p className="text-sm text-gray-500 mt-1">{filteredEvents.length}件のイベント</p>
          </div>
        </div>
      </div>

      {/* 今後のイベント */}
      {futureEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">今後のイベント</h2>
          <div className="space-y-3">{futureEvents.map(renderEventCard)}</div>
        </div>
      )}

      {/* 過去のイベント */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">過去のイベント</h2>
          <div className="space-y-3">{pastEvents.map(renderEventCard)}</div>
        </div>
      )}

      {/* データが空の場合 */}
      {filteredEvents.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600">
            {filter === 'all'
              ? 'ライフイベントが登録されていません'
              : `${categoryLabels[filter]}のイベントがありません`}
          </p>
          <p className="text-sm text-gray-500 mt-2">上の「+ イベントを追加」ボタンから登録してください</p>
        </div>
      )}
    </div>
  );
}
