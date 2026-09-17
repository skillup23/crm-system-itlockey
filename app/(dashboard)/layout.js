'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Дашборд', href: '/' },
    { name: 'Задачи', href: '/tasks' },
    { name: 'Организации', href: '/organizations' },
    ...(session?.user?.role === 'admin'
      ? [{ name: 'Сотрудники', href: '/users' }]
      : []),
    { name: 'База знаний', href: '/faq' },
    { name: 'Платежи', href: '/payments' },
    { name: 'Бэкапы', href: '/backups' },
  ];

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Десктопный Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 text-white shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-lg font-black tracking-wider text-blue-400">
            IT CRM
          </span>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-semibold">
            {session?.user?.role === 'admin' ? 'Admin' : 'Staff'}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-sm font-bold text-slate-200 truncate">
            {session?.user?.name}
          </div>
          <div className="text-xs text-slate-400 truncate mb-3">
            {session?.user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Оверлей мобильного меню */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Выдвижное мобильное меню */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-lg font-black text-blue-400">IT CRM</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-sm font-bold text-slate-200 truncate">
            {session?.user?.name}
          </div>
          <div className="text-xs text-slate-400 truncate mb-3">
            {session?.user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-lg bg-slate-800 text-red-400 text-xs font-semibold"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Основная рабочая область */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Мобильный хедер с кнопкой бургера */}
        <header className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-bold text-sm text-blue-400">IT CRM</span>
          <span className="text-xs text-slate-400 truncate max-w-30">
            {session?.user?.name}
          </span>
        </header>

        {/* Контейнер страниц с нужным отступом p-4 md:p-8 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
