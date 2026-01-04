import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'ダッシュボード', href: '/' },
  { name: '資産管理', href: '/assets' },
  { name: '収支管理', href: '/transactions' },
  { name: 'ライフイベント', href: '/life-events' },
  { name: 'シミュレーション', href: '/simulation' },
  { name: 'レポート', href: '/reports' },
  { name: '設定', href: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      {/* ヘッダー */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Life Planner</h1>
          <p className="text-xs text-slate-500 mt-0.5">資産管理システム</p>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* フッター */}
      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-500 text-center">
          © 2026 Life Planner
        </p>
        <p className="text-xs text-slate-400 text-center mt-1">
          v1.0.0
        </p>
      </div>
    </div>
  );
}
