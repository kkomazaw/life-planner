export type AssetType = 'cash' | 'investment' | 'property' | 'insurance' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  acquisitionDate: Date;
  memo?: string;
  // 保険固有のフィールド
  monthlyPremium?: number; // 月額保険料
  paymentEndAge?: number; // 支払い終了年齢
  coverageAmount?: number; // 保険金額
  coverageType?: string; // 保険の種類（死亡保険、医療保険など）
  linkedMemberId?: string; // 加入者の家族メンバーID
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
    insurance: number;
    other: number;
  };
}
