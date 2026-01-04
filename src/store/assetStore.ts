import { create } from 'zustand';
import type { Asset, AssetHistory } from '@/types/asset';

interface AssetState {
  assets: Asset[];
  assetHistory: AssetHistory[];
  setAssets: (assets: Asset[]) => void;
  setAssetHistory: (history: AssetHistory[]) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addAssetHistory: (history: AssetHistory) => void;
  updateAssetHistory: (id: string, history: Partial<AssetHistory>) => void;
  deleteAssetHistory: (id: string) => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  assetHistory: [],

  setAssets: (assets) => set({ assets }),
  setAssetHistory: (history) => set({ assetHistory: history }),

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
    })),

  updateAsset: (id, updates) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates, updatedAt: new Date() } : asset
      ),
    })),

  deleteAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
      assetHistory: state.assetHistory.filter((history) => history.assetId !== id),
    })),

  addAssetHistory: (history) =>
    set((state) => ({
      assetHistory: [...state.assetHistory, history],
    })),

  updateAssetHistory: (id, updates) =>
    set((state) => ({
      assetHistory: state.assetHistory.map((history) =>
        history.id === id ? { ...history, ...updates, updatedAt: new Date() } : history
      ),
    })),

  deleteAssetHistory: (id) =>
    set((state) => ({
      assetHistory: state.assetHistory.filter((history) => history.id !== id),
    })),
}));
