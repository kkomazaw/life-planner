import { useState } from 'react';
import { AssetList } from '@/components/assets/AssetList';
import { AssetForm } from '@/components/assets/AssetForm';
import { AssetHistoryForm } from '@/components/assets/AssetHistoryForm';
import type { Asset } from '@/types/asset';

export function AssetsPage() {
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddAsset = () => {
    setEditingAsset(undefined);
    setShowAssetForm(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleAddHistory = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowHistoryForm(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">資産管理</h1>
        <button
          onClick={handleAddAsset}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 資産を追加
        </button>
      </div>

      <AssetList
        key={refreshKey}
        onEdit={handleEditAsset}
        onAddHistory={handleAddHistory}
      />

      {showAssetForm && (
        <AssetForm
          asset={editingAsset}
          onClose={() => setShowAssetForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showHistoryForm && selectedAsset && (
        <AssetHistoryForm
          asset={selectedAsset}
          onClose={() => setShowHistoryForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
