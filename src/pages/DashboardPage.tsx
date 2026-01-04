export function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">総資産額</h2>
          <p className="text-3xl font-bold text-blue-600">¥0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">今月の収入</h2>
          <p className="text-3xl font-bold text-green-600">¥0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">今月の支出</h2>
          <p className="text-3xl font-bold text-red-600">¥0</p>
        </div>
      </div>
    </div>
  );
}
