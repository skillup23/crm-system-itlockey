'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Дашборд', href: '/' },
    { name: 'Заявки', href: '/tasks' },
    { name: 'Организации', href: '/organizations' },
    ...(session?.user?.role === 'admin'
      ? [{ name: 'Сотрудники', href: '/users' }]
      : []),
    { name: 'База знаний', href: '/faq' },
    { name: 'Платежи', href: '/payments' },
    { name: 'Бэкапы', href: '/backups' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Боковая панель */}
      <aside className="w-64 bg-slate-900 text-slate-200 hidden md:flex flex-col border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
            IT CRM
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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

        {/* Профиль внизу сайдбара */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-sm font-semibold text-white truncate">
                {session?.user?.name || 'Пользователь'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-md hover:bg-slate-800 transition-colors"
              title="Выйти"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Основная рабочая область */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Шапка для десктопа и мобилки */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="md:hidden font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            IT CRM
          </div>
          <div className="hidden md:block">
            <span className="text-sm text-slate-500">
              Система учета заявок и сервисов
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {session?.user?.role === 'admin' ? 'Администратор' : 'Сотрудник'}
            </span>
          </div>
        </header>

        {/* Контент страницы */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
