import { useState } from 'react';
import { useHousehold } from '@/hooks/useHousehold';
import { calculateAge } from '@/types/household';
import type {
  HouseholdMember,
  MemberRelation,
  EmploymentStatus,
} from '@/types/household';

const relationLabels: Record<MemberRelation, string> = {
  self: '本人',
  spouse: '配偶者',
  child: '子供',
  parent: '親',
  other: 'その他',
};

const employmentStatusLabels: Record<EmploymentStatus, string> = {
  employed: '会社員',
  'self-employed': '自営業',
  unemployed: '無職',
  student: '学生',
  retired: '退職済み',
};

export function HouseholdManagement() {
  const { members, createMember, updateMember, deleteMember } = useHousehold();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    relation: 'self' as MemberRelation,
    birthDate: '',
    employmentStatus: 'employed' as EmploymentStatus,
    retirementAge: 65,
    pensionStartAge: 65,
    expectedPensionAmount: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      relation: 'self',
      birthDate: '',
      employmentStatus: 'employed',
      retirementAge: 65,
      pensionStartAge: 65,
      expectedPensionAmount: 0,
    });
    setEditingMember(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMember) {
        await updateMember(editingMember.id, {
          name: formData.name,
          relation: formData.relation,
          birthDate: new Date(formData.birthDate),
          employmentStatus: formData.employmentStatus,
          retirementAge: formData.retirementAge,
          pensionStartAge: formData.pensionStartAge,
          expectedPensionAmount: formData.expectedPensionAmount,
        });
      } else {
        await createMember({
          name: formData.name,
          relation: formData.relation,
          birthDate: new Date(formData.birthDate),
          employmentStatus: formData.employmentStatus,
          retirementAge: formData.retirementAge,
          pensionStartAge: formData.pensionStartAge,
          expectedPensionAmount: formData.expectedPensionAmount,
        });
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save member:', error);
      alert('メンバーの保存に失敗しました');
    }
  };

  const handleEdit = (member: HouseholdMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      relation: member.relation,
      birthDate: member.birthDate.toISOString().split('T')[0],
      employmentStatus: member.employmentStatus,
      retirementAge: member.retirementAge ?? 65,
      pensionStartAge: member.pensionStartAge ?? 65,
      expectedPensionAmount: member.expectedPensionAmount ?? 0,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('このメンバーを削除してもよろしいですか？')) {
      try {
        await deleteMember(id);
      } catch (error) {
        console.error('Failed to delete member:', error);
        alert('メンバーの削除に失敗しました');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">家族構成</h2>
          <p className="text-sm text-slate-600 mt-1">
            家族メンバーの情報を登録すると、年齢に基づいた退職・年金のライフイベントが自動生成されます
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          メンバーを追加
        </button>
      </div>

      {/* メンバーリスト */}
      {members.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-600">家族メンバーが登録されていません</p>
          <p className="text-sm text-slate-500 mt-2">
            「メンバーを追加」ボタンから登録してください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {members.map((member) => {
            const age = calculateAge(member.birthDate);
            return (
              <div key={member.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {member.name}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {relationLabels[member.relation]}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                        {employmentStatusLabels[member.employmentStatus]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">年齢</p>
                        <p className="font-semibold text-slate-900">{age}歳</p>
                      </div>
                      <div>
                        <p className="text-slate-600">生年月日</p>
                        <p className="font-semibold text-slate-900">
                          {member.birthDate.toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      {member.retirementAge && (
                        <div>
                          <p className="text-slate-600">退職予定年齢</p>
                          <p className="font-semibold text-slate-900">
                            {member.retirementAge}歳
                          </p>
                        </div>
                      )}
                      {member.pensionStartAge && (
                        <div>
                          <p className="text-slate-600">年金開始年齢</p>
                          <p className="font-semibold text-slate-900">
                            {member.pensionStartAge}歳
                          </p>
                        </div>
                      )}
                      {member.expectedPensionAmount && member.expectedPensionAmount > 0 && (
                        <div>
                          <p className="text-slate-600">予定年金月額</p>
                          <p className="font-semibold text-slate-900">
                            ¥{member.expectedPensionAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(member)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      aria-label="編集"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label="削除"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* フォームモーダル */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {editingMember ? 'メンバー情報を編集' : 'メンバーを追加'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 名前 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-modern w-full"
                    placeholder="例: 山田太郎"
                  />
                </div>

                {/* 関係性 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    続柄 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.relation}
                    onChange={(e) =>
                      setFormData({ ...formData, relation: e.target.value as MemberRelation })
                    }
                    className="input-modern w-full"
                  >
                    {Object.entries(relationLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 生年月日 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    生年月日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="input-modern w-full"
                  />
                </div>

                {/* 雇用状態 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    雇用状態 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.employmentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentStatus: e.target.value as EmploymentStatus,
                      })
                    }
                    className="input-modern w-full"
                  >
                    {Object.entries(employmentStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 退職予定年齢 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      退職予定年齢
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.retirementAge}
                      onChange={(e) =>
                        setFormData({ ...formData, retirementAge: parseInt(e.target.value) })
                      }
                      className="input-modern w-full"
                    />
                  </div>

                  {/* 年金開始年齢 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      年金開始年齢
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.pensionStartAge}
                      onChange={(e) =>
                        setFormData({ ...formData, pensionStartAge: parseInt(e.target.value) })
                      }
                      className="input-modern w-full"
                    />
                  </div>
                </div>

                {/* 予定年金月額 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    予定年金月額（円）
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.expectedPensionAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedPensionAmount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-modern w-full"
                    placeholder="例: 150000"
                  />
                </div>

                {/* ボタン */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingMember ? '更新' : '追加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
