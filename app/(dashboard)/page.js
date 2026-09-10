'use client';

import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';

export default function Home() {
  const stats = [
    {
      title: 'Новых заявок',
      count: 0,
      color: 'border-l-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'В работе',
      count: 0,
      color: 'border-l-amber-500',
      textColor: 'text-amber-600',
    },
    {
      title: 'Ожидают ответа',
      count: 0,
      color: 'border-l-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Горящие дедлайны',
      count: 0,
      color: 'border-l-red-500',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Сводка задач</h1>
          <p className="text-sm text-slate-500">
            Оперативная информация по IT-заявкам клиентов
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-all"
        >
          + Создать заявку
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            count={item.count}
            color={item.color}
            textColor={item.textColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              Текущие заявки
            </h2>
            <Link
              href="/tasks"
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Смотреть все →
            </Link>
          </div>
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">
              Активных задач нет
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Очередь чиста, либо создайте новую заявку через кнопку выше
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 pb-4 border-b border-slate-100 mb-4">
            Быстрый доступ
          </h2>
          <div className="space-y-2">
            <Link
              href="/organizations"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <span className="text-sm font-medium text-slate-700">
                Организации на обслуживании
              </span>
              <span className="text-xs text-slate-400">→</span>
            </Link>
            <Link
              href="/faq"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <span className="text-sm font-medium text-slate-700">
                База инструкций IT
              </span>
              <span className="text-xs text-slate-400">→</span>
            </Link>
            <Link
              href="/payments"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <span className="text-sm font-medium text-slate-700">
                Оплата доменов и серверов
              </span>
              <span className="text-xs text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
