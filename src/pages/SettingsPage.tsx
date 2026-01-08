import { DataBackup } from '@/components/settings/DataBackup';
import { DataImport } from '@/components/settings/DataImport';
import { HouseholdManagement } from '@/components/settings/HouseholdManagement';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">設定</h1>
        <p className="text-sm text-slate-600 mt-1">
          家族構成の管理とデータのバックアップ・インポート機能
        </p>
      </div>

      <div className="card p-6">
        <HouseholdManagement />
      </div>

      <DataImport />
      <DataBackup />
    </div>
  );
}
