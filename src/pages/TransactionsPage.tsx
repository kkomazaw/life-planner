import { TransactionTable } from '@/components/transactions/TransactionTable';
import { CashFlowChart } from '@/components/transactions/CashFlowChart';

export function TransactionsPage() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">収支管理</h1>
        <p className="text-sm text-slate-600">
          収入と支出を記録して、キャッシュフローを管理しましょう
        </p>
      </div>

      {/* キャッシュフロー推移グラフ */}
      <CashFlowChart />

      {/* トランザクション記録テーブル */}
      <TransactionTable />

      {/* 使い方ガイド */}
      <div className="card p-6 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">💡 使い方</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• 収入・支出タブを切り替えて、各項目を記録できます</li>
          <li>• テーブルのセルをクリックすると、その場で編集できます</li>
          <li>• 「+ 収入を追加」「+ 支出を追加」ボタンで新しい記録を追加します</li>
          <li>• 上部のグラフで月ごとのキャッシュフローの推移を確認できます</li>
        </ul>
      </div>
    </div>
  );
}
