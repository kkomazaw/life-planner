import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  currency: string;
  lastBackupDate: Date | null;
  setLastBackupDate: (date: Date) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'JPY',
      lastBackupDate: null,
      setLastBackupDate: (date) => set({ lastBackupDate: date }),
    }),
    {
      name: 'life-planner-settings',
    }
  )
);
