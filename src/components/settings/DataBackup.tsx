import { useState } from 'react';
import { db } from '@/lib/db';
import { useSettingsStore } from '@/store/settingsStore';

export function DataBackup() {
  const { lastBackupDate, setLastBackupDate } = useSettingsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // すべてのデータを取得
      const [
        assets,
        assetHistory,
        incomes,
        expenses,
        expenseCategories,
        lifeEvents,
        simulationSettings,
      ] = await Promise.all([
        db.assets.toArray(),
        db.assetHistory.toArray(),
        db.incomes.toArray(),
        db.expenses.toArray(),
        db.expenseCategories.toArray(),
        db.lifeEvents.toArray(),
        db.simulationSettings.toArray(),
      ]);

      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          assets,
          assetHistory,
          incomes,
          expenses,
          expenseCategories,
          lifeEvents,
          simulationSettings,
        },
      };

      // JSON形式でダウンロード
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackupDate(new Date());
    } catch (error) {
      console.error('Export failed:', error);
      alert('バックアップに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');
    setImportSuccess(false);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      // バリデーション
      if (!backup.version || !backup.data) {
        throw new Error('無効なバックアップファイルです');
      }

      // 確認ダイアログ
      if (
        !confirm(
          '既存のデータは削除されます。インポートを続行しますか？\n\n' +
            `バックアップ日時: ${new Date(backup.exportDate).toLocaleString()}\n` +
            `バージョン: ${backup.version}`
        )
      ) {
        event.target.value = '';
        setIsImporting(false);
        return;
      }

      // 既存のデータを削除
      await db.transaction('rw', db.tables, async () => {
        await Promise.all([
          db.assets.clear(),
          db.assetHistory.clear(),
          db.incomes.clear(),
          db.expenses.clear(),
          db.expenseCategories.clear(),
          db.lifeEvents.clear(),
          db.simulationSettings.clear(),
        ]);

        // 新しいデータをインポート
        if (backup.data.assets?.length) await db.assets.bulkAdd(backup.data.assets);
        if (backup.data.assetHistory?.length)
          await db.assetHistory.bulkAdd(backup.data.assetHistory);
        if (backup.data.incomes?.length) await db.incomes.bulkAdd(backup.data.incomes);
        if (backup.data.expenses?.length) await db.expenses.bulkAdd(backup.data.expenses);
        if (backup.data.expenseCategories?.length)
          await db.expenseCategories.bulkAdd(backup.data.expenseCategories);
        if (backup.data.lifeEvents?.length) await db.lifeEvents.bulkAdd(backup.data.lifeEvents);
        if (backup.data.simulationSettings?.length)
          await db.simulationSettings.bulkAdd(backup.data.simulationSettings);
      });

      setImportSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportError(
        error instanceof Error ? error.message : 'インポートに失敗しました'
      );
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* バックアップ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">データのバックアップ</h2>
        <p className="text-gray-600 mb-4">
          すべてのデータをJSON形式でエクスポートします。定期的にバックアップを取ることをお勧めします。
        </p>
        {lastBackupDate && (
          <p className="text-sm text-gray-500 mb-4">
            最終バックアップ: {new Date(lastBackupDate).toLocaleString()}
          </p>
        )}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'エクスポート中...' : 'バックアップをダウンロード'}
        </button>
      </div>

      {/* リストア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">データの復元</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-yellow-800 font-medium">⚠️ 注意</p>
          <p className="text-yellow-700 text-sm mt-1">
            データを復元すると、現在のデータはすべて削除されます。必ず事前にバックアップを取ってください。
          </p>
        </div>

        {importError && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-700">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <p className="text-green-700">
              データの復元が完了しました。ページを再読み込みします...
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="import-file"
            className="inline-block px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? 'インポート中...' : 'バックアップファイルを選択'}
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isImporting}
            className="hidden"
          />
        </div>
      </div>

      {/* データ削除 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">すべてのデータを削除</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-800 font-medium">⚠️ 危険な操作</p>
          <p className="text-red-700 text-sm mt-1">
            この操作は取り消せません。必ず事前にバックアップを取ってください。
          </p>
        </div>
        <button
          onClick={async () => {
            if (
              confirm(
                'すべてのデータを削除してもよろしいですか？\nこの操作は取り消せません。'
              ) &&
              confirm('本当に削除しますか？')
            ) {
              await db.transaction('rw', db.tables, async () => {
                await Promise.all(db.tables.map((table) => table.clear()));
              });
              alert('すべてのデータを削除しました。');
              window.location.reload();
            }
          }}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          すべてのデータを削除
        </button>
      </div>
    </div>
  );
}
