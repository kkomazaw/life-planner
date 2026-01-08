import { useState, useEffect } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useHousehold } from '@/hooks/useHousehold';
import { formatYearMonth } from '@/lib/utils';
import type { Asset, AssetType } from '@/types/asset';

const assetTypeOptions: { value: AssetType; label: string }[] = [
  { value: 'cash', label: '現金・預金' },
  { value: 'investment', label: '投資' },
  { value: 'property', label: '不動産' },
  { value: 'insurance', label: '保険' },
  { value: 'other', label: 'その他' },
];

interface AssetFormProps {
  asset?: Asset;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssetForm({ asset, onClose, onSuccess }: AssetFormProps) {
  const { createAsset, updateAsset } = useAssets();
  const { members: householdMembers } = useHousehold();
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('cash');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [memo, setMemo] = useState('');

  // 保険固有のフィールド
  const [monthlyPremium, setMonthlyPremium] = useState('');
  const [paymentEndAge, setPaymentEndAge] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [coverageType, setCoverageType] = useState('');
  const [linkedMemberId, setLinkedMemberId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!asset;

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setType(asset.type);
      setAcquisitionDate(formatYearMonth(asset.acquisitionDate));
      setMemo(asset.memo || '');

      // 保険固有のフィールド
      if (asset.type === 'insurance') {
        setMonthlyPremium(asset.monthlyPremium?.toString() || '');
        setPaymentEndAge(asset.paymentEndAge?.toString() || '');
        setCoverageAmount(asset.coverageAmount?.toString() || '');
        setCoverageType(asset.coverageType || '');
        setLinkedMemberId(asset.linkedMemberId || '');
      }
    } else {
      // デフォルトは今月
      const now = new Date();
      setAcquisitionDate(formatYearMonth(now));
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('資産名を入力してください');
      return;
    }

    if (!acquisitionDate) {
      setError('取得日を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const [year, month] = acquisitionDate.split('-').map(Number);
      const date = new Date(year, month - 1, 1);

      // 基本データ
      const assetData: any = {
        name: name.trim(),
        type,
        acquisitionDate: date,
        memo: memo.trim() || undefined,
      };

      // 保険固有のデータを追加
      if (type === 'insurance') {
        assetData.monthlyPremium = monthlyPremium ? parseFloat(monthlyPremium) : undefined;
        assetData.paymentEndAge = paymentEndAge ? parseInt(paymentEndAge, 10) : undefined;
        assetData.coverageAmount = coverageAmount ? parseFloat(coverageAmount) : undefined;
        assetData.coverageType = coverageType.trim() || undefined;
        assetData.linkedMemberId = linkedMemberId || undefined;
      }

      if (isEdit && asset) {
        await updateAsset(asset.id, assetData);
      } else {
        await createAsset(assetData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('保存に失敗しました');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? '資産を編集' : '資産を追加'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              資産名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 三菱UFJ銀行 普通預金"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              資産種別 <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as AssetType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">
              取得年月 <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              id="acquisitionDate"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="メモを入力"
            />
          </div>

          {/* 保険固有のフィールド */}
          {type === 'insurance' && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">保険情報</h3>

              <div>
                <label htmlFor="coverageType" className="block text-sm font-medium text-gray-700 mb-1">
                  保険の種類
                </label>
                <input
                  type="text"
                  id="coverageType"
                  value={coverageType}
                  onChange={(e) => setCoverageType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 死亡保険、医療保険、がん保険"
                />
              </div>

              <div>
                <label htmlFor="monthlyPremium" className="block text-sm font-medium text-gray-700 mb-1">
                  月額保険料（円）
                </label>
                <input
                  type="number"
                  id="monthlyPremium"
                  value={monthlyPremium}
                  onChange={(e) => setMonthlyPremium(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 3700"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label htmlFor="paymentEndAge" className="block text-sm font-medium text-gray-700 mb-1">
                  支払い終了年齢（歳）
                </label>
                <input
                  type="number"
                  id="paymentEndAge"
                  value={paymentEndAge}
                  onChange={(e) => setPaymentEndAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 60"
                  min="0"
                  max="120"
                />
                <p className="text-xs text-gray-500 mt-1">
                  何歳まで保険料を支払うか
                </p>
              </div>

              <div>
                <label htmlFor="coverageAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  保険金額（円）
                </label>
                <input
                  type="number"
                  id="coverageAmount"
                  value={coverageAmount}
                  onChange={(e) => setCoverageAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 10000000（1000万円）"
                  min="0"
                  step="100000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  死亡時や満期時に受け取れる金額
                </p>
              </div>

              <div>
                <label htmlFor="linkedMemberId" className="block text-sm font-medium text-gray-700 mb-1">
                  加入者
                </label>
                <select
                  id="linkedMemberId"
                  value={linkedMemberId}
                  onChange={(e) => setLinkedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {householdMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}（{member.relation}）
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  保険に加入している家族メンバー
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : isEdit ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
