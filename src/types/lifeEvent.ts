export type LifeEventCategory = 'education' | 'housing' | 'vehicle' | 'retirement' | 'other';

export interface LifeEvent {
  id: string;
  name: string;
  date: Date; // 発生時期
  category: LifeEventCategory;
  estimatedCost: number;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}
