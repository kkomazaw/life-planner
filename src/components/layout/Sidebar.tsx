import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'ダッシュボード', href: '/', icon: '📊' },
  { name: '資産管理', href: '/assets', icon: '💰' },
  { name: '収支管理', href: '/transactions', icon: '💳' },
  { name: 'ライフイベント', href: '/life-events', icon: '🎯' },
  { name: 'シミュレーション', href: '/simulation', icon: '📈' },
  { name: 'レポート', href: '/reports', icon: '📄' },
  { name: '設定', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col glass-dark backdrop-blur-2xl border-r border-white/10">
      {/* ヘッダー */}
      <div className="flex h-20 items-center justify-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl">💎</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Life Planner</h1>
            <p className="text-xs text-slate-400">資産管理システム</p>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
              )}
            >
              {/* アクティブ時の光る効果 */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
              )}

              <span className={cn(
                "text-xl transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              <span className="relative z-10">{item.name}</span>

              {/* ホバー時のインジケーター */}
              {!isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-400 rounded-l-full transition-all duration-300 group-hover:h-8" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* フッター */}
      <div className="border-t border-white/10 p-6">
        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400 text-center font-medium">
            © 2026 Life Planner
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
