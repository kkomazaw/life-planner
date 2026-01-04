import { DataBackup } from '@/components/settings/DataBackup';

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">設定</h1>
      <DataBackup />
    </div>
  );
}
