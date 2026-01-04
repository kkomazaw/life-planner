import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { useLifeEventStore } from '@/store/lifeEventStore';
import type { LifeEvent, LifeEventCategory } from '@/types/lifeEvent';

export function useLifeEvents() {
  const store = useLifeEventStore();

  // データベースからライフイベントを取得してストアに同期
  const lifeEvents = useLiveQuery(() => db.lifeEvents.toArray());

  useEffect(() => {
    if (lifeEvents) {
      store.setLifeEvents(lifeEvents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lifeEvents]);

  // ライフイベントを作成
  const createLifeEvent = async (data: {
    name: string;
    date: Date;
    category: LifeEventCategory;
    estimatedCost: number;
    memo?: string;
  }) => {
    const now = new Date();
    const lifeEvent: LifeEvent = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.lifeEvents.add(lifeEvent);
    return lifeEvent;
  };

  // ライフイベントを更新
  const updateLifeEvent = async (
    id: string,
    updates: Partial<Omit<LifeEvent, 'id' | 'createdAt'>>
  ) => {
    await db.lifeEvents.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // ライフイベントを削除
  const deleteLifeEvent = async (id: string) => {
    await db.lifeEvents.delete(id);
  };

  return {
    lifeEvents: store.lifeEvents,
    createLifeEvent,
    updateLifeEvent,
    deleteLifeEvent,
  };
}
