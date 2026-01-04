import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* パターン背景 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99, 102, 241) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* メインコンテンツ */}
        <div className="relative container mx-auto px-8 py-8 max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
