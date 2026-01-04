import { create } from 'zustand';
import type { LifeEvent } from '@/types/lifeEvent';

interface LifeEventState {
  lifeEvents: LifeEvent[];
  setLifeEvents: (lifeEvents: LifeEvent[]) => void;
  addLifeEvent: (lifeEvent: LifeEvent) => void;
  updateLifeEvent: (id: string, lifeEvent: Partial<LifeEvent>) => void;
  deleteLifeEvent: (id: string) => void;
}

export const useLifeEventStore = create<LifeEventState>((set) => ({
  lifeEvents: [],

  setLifeEvents: (lifeEvents) => set({ lifeEvents }),

  addLifeEvent: (lifeEvent) =>
    set((state) => ({
      lifeEvents: [...state.lifeEvents, lifeEvent],
    })),

  updateLifeEvent: (id, updates) =>
    set((state) => ({
      lifeEvents: state.lifeEvents.map((event) =>
        event.id === id ? { ...event, ...updates, updatedAt: new Date() } : event
      ),
    })),

  deleteLifeEvent: (id) =>
    set((state) => ({
      lifeEvents: state.lifeEvents.filter((event) => event.id !== id),
    })),
}));
