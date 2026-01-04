import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { useAssetStore } from '@/store/assetStore';
import type { Asset, AssetHistory, AssetType } from '@/types/asset';

export function useAssets() {
  const store = useAssetStore();

  // データベースから資産を取得してストアに同期
  const assets = useLiveQuery(() => db.assets.toArray());
  const assetHistory = useLiveQuery(() => db.assetHistory.toArray());

  useEffect(() => {
    if (assets) {
      store.setAssets(assets);
    }
  }, [assets, store]);

  useEffect(() => {
    if (assetHistory) {
      store.setAssetHistory(assetHistory);
    }
  }, [assetHistory, store]);

  // 資産を作成
  const createAsset = async (data: {
    name: string;
    type: AssetType;
    acquisitionDate: Date;
    memo?: string;
  }) => {
    const now = new Date();
    const asset: Asset = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.assets.add(asset);
    return asset;
  };

  // 資産を更新
  const updateAsset = async (id: string, updates: Partial<Omit<Asset, 'id' | 'createdAt'>>) => {
    await db.assets.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // 資産を削除
  const deleteAsset = async (id: string) => {
    // 資産に関連する履歴も削除
    await db.assetHistory.where('assetId').equals(id).delete();
    await db.assets.delete(id);
  };

  // 資産履歴を追加
  const createAssetHistory = async (data: {
    assetId: string;
    date: Date;
    value: number;
  }) => {
    const now = new Date();
    const history: AssetHistory = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.assetHistory.add(history);
    return history;
  };

  // 資産履歴を更新
  const updateAssetHistory = async (
    id: string,
    updates: Partial<Omit<AssetHistory, 'id' | 'assetId' | 'createdAt'>>
  ) => {
    await db.assetHistory.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  // 資産履歴を削除
  const deleteAssetHistory = async (id: string) => {
    await db.assetHistory.delete(id);
  };

  // 特定の資産の履歴を取得
  const getAssetHistory = (assetId: string) => {
    return store.assetHistory.filter((h) => h.assetId === assetId).sort((a, b) =>
      b.date.getTime() - a.date.getTime()
    );
  };

  return {
    assets: store.assets,
    assetHistory: store.assetHistory,
    createAsset,
    updateAsset,
    deleteAsset,
    createAssetHistory,
    updateAssetHistory,
    deleteAssetHistory,
    getAssetHistory,
  };
}
