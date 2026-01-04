import { useEffect, useState } from 'react';
import { initializeDatabase } from './lib/db';

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initializeDatabase()
      .then(() => {
        setDbInitialized(true);
        console.log('Database initialized successfully');
      })
      .catch((error) => {
        console.error('Failed to initialize database:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Life Planner</h1>
        <p className="text-lg text-gray-600">家族資産管理・ライフプランシミュレーター</p>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            プロジェクトセットアップ完了
          </h2>

          <div className="space-y-2">
            <div className="flex items-center">
              <span
                className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  dbInitialized ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              ></span>
              <span className="text-gray-700">
                データベース: {dbInitialized ? '初期化完了' : '初期化中...'}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">次のステップ</h3>
            <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
              <li>Phase 1: MVP開発を開始</li>
              <li>資産管理機能の実装</li>
              <li>収支管理機能の実装</li>
              <li>ダッシュボードの実装</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
