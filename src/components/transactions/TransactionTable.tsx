import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useHousehold } from '@/hooks/useHousehold';
import { formatCurrency } from '@/lib/utils';

export function TransactionTable() {
  const {
    incomes,
    expenses,
    incomeCategories,
    expenseCategories,
    createIncome,
    updateIncome,
    deleteIncome,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useTransactions();
  const { members: householdMembers } = useHousehold();

  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().slice(0, 7),
    categoryId: '',
    amount: '',
    memo: '',
    linkedMemberId: '',
  });

  // 月ごとにグループ化してソート
  const sortedIncomes = useMemo(() => {
    return [...incomes].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [incomes]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses]);

  // セルの編集開始
  const startEditing = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  // セルの編集完了
  const finishEditing = async () => {
    if (!editingCell) return;

    const { id, field } = editingCell;

    try {
      if (activeTab === 'income') {
        if (field === 'date') {
          await updateIncome(id, { date: new Date(editValue) });
        } else if (field === 'categoryId') {
          await updateIncome(id, { categoryId: editValue });
        } else if (field === 'amount') {
          const amount = parseFloat(editValue.replace(/,/g, ''));
          if (!isNaN(amount)) {
            await updateIncome(id, { amount });
          }
        } else if (field === 'memo') {
          await updateIncome(id, { memo: editValue });
        } else if (field === 'linkedMemberId') {
          await updateIncome(id, { linkedMemberId: editValue || undefined });
        }
      } else {
        if (field === 'date') {
          await updateExpense(id, { date: new Date(editValue) });
        } else if (field === 'categoryId') {
          await updateExpense(id, { categoryId: editValue });
        } else if (field === 'amount') {
          const amount = parseFloat(editValue.replace(/,/g, ''));
          if (!isNaN(amount)) {
            await updateExpense(id, { amount });
          }
        } else if (field === 'memo') {
          await updateExpense(id, { memo: editValue });
        }
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }

    setEditingCell(null);
    setEditValue('');
  };

  // 新規追加
  const handleAddTransaction = async () => {
    if (!newTransaction.categoryId || !newTransaction.amount) return;

    try {
      const amount = parseFloat(newTransaction.amount.replace(/,/g, ''));
      if (isNaN(amount)) return;

      const date = new Date(newTransaction.date + '-01');

      if (activeTab === 'income') {
        await createIncome({
          date,
          categoryId: newTransaction.categoryId,
          amount,
          memo: newTransaction.memo,
          linkedMemberId: newTransaction.linkedMemberId || undefined,
        });
      } else {
        await createExpense({
          date,
          categoryId: newTransaction.categoryId,
          amount,
          memo: newTransaction.memo,
        });
      }

      setNewTransaction({
        date: new Date().toISOString().slice(0, 7),
        categoryId: '',
        amount: '',
        memo: '',
        linkedMemberId: '',
      });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  // 削除
  const handleDelete = async (id: string) => {
    if (window.confirm('このトランザクションを削除してもよろしいですか？')) {
      try {
        if (activeTab === 'income') {
          await deleteIncome(id);
        } else {
          await deleteExpense(id);
        }
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const transactions = activeTab === 'income' ? sortedIncomes : sortedExpenses;
  const categories = activeTab === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="card overflow-hidden">
      {/* タブ */}
      <div className="border-b border-slate-200 flex">
        <button
          onClick={() => setActiveTab('income')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'income'
              ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          収入
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'expense'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          支出
        </button>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                年月
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                金額
              </th>
              {activeTab === 'income' && (
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  担当者
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                メモ
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider w-20">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const category = categories.find((c) => c.id === transaction.categoryId);
              const dateStr = transaction.date.toISOString().slice(0, 7);
              const linkedMember = activeTab === 'income' && 'linkedMemberId' in transaction
                ? householdMembers.find((m) => m.id === transaction.linkedMemberId)
                : undefined;

              return (
                <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {editingCell?.id === transaction.id && editingCell?.field === 'date' ? (
                      <input
                        type="month"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                        autoFocus
                        className="input-modern py-1 text-sm"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(transaction.id, 'date', dateStr)}
                        className="cursor-pointer text-sm text-slate-900 hover:text-blue-600 py-1"
                      >
                        {new Date(transaction.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.id === transaction.id && editingCell?.field === 'categoryId' ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        autoFocus
                        className="input-modern py-1 text-sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        onClick={() => startEditing(transaction.id, 'categoryId', transaction.categoryId)}
                        className="cursor-pointer text-sm text-slate-600 hover:text-blue-600 py-1"
                      >
                        {category?.name || '未分類'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingCell?.id === transaction.id && editingCell?.field === 'amount' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                        autoFocus
                        className="input-modern py-1 text-sm text-right"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(transaction.id, 'amount', transaction.amount.toString())}
                        className="cursor-pointer text-sm font-semibold text-slate-900 hover:text-blue-600 py-1"
                      >
                        {formatCurrency(transaction.amount)}
                      </div>
                    )}
                  </td>
                  {activeTab === 'income' && (
                    <td className="px-4 py-3">
                      {editingCell?.id === transaction.id && editingCell?.field === 'linkedMemberId' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={finishEditing}
                          autoFocus
                          className="input-modern py-1 text-sm"
                        >
                          <option value="">なし</option>
                          {householdMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          onClick={() => startEditing(transaction.id, 'linkedMemberId', ('linkedMemberId' in transaction ? transaction.linkedMemberId : '') || '')}
                          className="cursor-pointer text-sm text-slate-600 hover:text-blue-600 py-1"
                        >
                          {linkedMember?.name || '-'}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {editingCell?.id === transaction.id && editingCell?.field === 'memo' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                        autoFocus
                        className="input-modern py-1 text-sm"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(transaction.id, 'memo', transaction.memo || '')}
                        className="cursor-pointer text-sm text-slate-600 hover:text-blue-600 py-1"
                      >
                        {transaction.memo || '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors text-sm"
                      title="削除"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* 新規追加行 */}
            {isAddingNew ? (
              <tr className={`${activeTab === 'income' ? 'bg-emerald-50 border-t-2 border-emerald-200' : 'bg-rose-50 border-t-2 border-rose-200'}`}>
                <td className="px-4 py-3">
                  <input
                    type="month"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="input-modern py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={newTransaction.categoryId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                    className="input-modern py-1 text-sm"
                  >
                    <option value="">カテゴリ選択</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTransaction()}
                    placeholder="0"
                    className="input-modern py-1 text-sm text-right"
                  />
                </td>
                {activeTab === 'income' && (
                  <td className="px-4 py-3">
                    <select
                      value={newTransaction.linkedMemberId}
                      onChange={(e) => setNewTransaction({ ...newTransaction, linkedMemberId: e.target.value })}
                      className="input-modern py-1 text-sm"
                    >
                      <option value="">なし</option>
                      {householdMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={newTransaction.memo}
                    onChange={(e) => setNewTransaction({ ...newTransaction, memo: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTransaction()}
                    placeholder="メモ（任意）"
                    className="input-modern py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={handleAddTransaction}
                    className={`${activeTab === 'income' ? 'text-emerald-600 hover:text-emerald-700' : 'text-rose-600 hover:text-rose-700'} text-sm font-medium mr-2`}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewTransaction({
                        date: new Date().toISOString().slice(0, 7),
                        categoryId: '',
                        amount: '',
                        memo: '',
                        linkedMemberId: '',
                      });
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ) : (
              <tr className="bg-slate-50">
                <td colSpan={activeTab === 'income' ? 6 : 5} className="px-4 py-3">
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className={`text-sm font-medium ${activeTab === 'income' ? 'text-emerald-600 hover:text-emerald-700' : 'text-rose-600 hover:text-rose-700'}`}
                  >
                    + {activeTab === 'income' ? '収入' : '支出'}を追加
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 合計 */}
      <div className="border-t-2 border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">
            {activeTab === 'income' ? '総収入額' : '総支出額'}
          </span>
          <span className={`text-lg font-bold ${activeTab === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(transactions.reduce((total, t) => total + t.amount, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}
