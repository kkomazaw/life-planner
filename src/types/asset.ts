export type AssetType = 'cash' | 'investment' | 'property' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  acquisitionDate: Date;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetHistory {
  id: string;
  assetId: string;
  date: Date; // 月末日
  value: number; // 評価額
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetWithHistory extends Asset {
  history: AssetHistory[];
}

export interface AssetSummary {
  totalValue: number;
  byType: {
    cash: number;
    investment: number;
    property: number;
    other: number;
  };
}
