import { useState } from 'react';
import { LifeEventList } from '@/components/lifeEvents/LifeEventList';
import { LifeEventForm } from '@/components/lifeEvents/LifeEventForm';
import type { LifeEvent } from '@/types/lifeEvent';

export function LifeEventsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditingEvent(undefined);
    setShowForm(true);
  };

  const handleEdit = (lifeEvent: LifeEvent) => {
    setEditingEvent(lifeEvent);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ライフイベント</h1>
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + イベントを追加
        </button>
      </div>

      <LifeEventList key={refreshKey} onEdit={handleEdit} />

      {showForm && (
        <LifeEventForm
          lifeEvent={editingEvent}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
