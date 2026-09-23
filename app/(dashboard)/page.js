'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        if (!ignore && Array.isArray(data)) {
          setTasks(data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Вычисляем показатели
  const openCount = tasks.filter((t) => t.status === 'Открыта').length;
  const inProgressCount = tasks.filter((t) => t.status === 'В работе').length;
  const waitingCount = tasks.filter((t) => t.status === 'Ожидание').length;

  const urgentCount = tasks.filter((t) => {
    if (!t.todoDeadline || t.status === 'Закрыта') return false;
    const diffDays = Math.ceil(
      (new Date(t.todoDeadline) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 3;
  }).length;

  const stats = [
    {
      title: 'Новых заявок',
      count: openCount,
      color: 'border-l-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'В работе',
      count: inProgressCount,
      color: 'border-l-amber-500',
      textColor: 'text-amber-600',
    },
    {
      title: 'Ожидают ответа',
      count: waitingCount,
      color: 'border-l-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Горящие дедлайны',
      count: urgentCount,
      color: 'border-l-red-500',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Сводка задач</h1>
          <p className="text-base text-slate-500">
            Оперативная информация по IT-заявкам клиентов
          </p>
        </div>
        <Link
          href="/tasks"
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              Свежие заявки
            </h2>
            <Link
              href="/tasks"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Все задачи →
            </Link>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Загрузка...
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Активных задач нет
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tasks.slice(0, 5).map((t) => (
                  <Link
                    key={t._id}
                    href={`/tasks/${t._id}`}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{t.company}</span>
                        <span>•</span>
                        <span>Исполнитель: {t.executor?.name || '—'}</span>
                      </div>
                    </div>
                    <StatusBadge status={t.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-800 pb-4 border-b border-slate-100 mb-4">
            Инфраструктура
          </h2>
          <div className="space-y-2.5">
            <Link
              href="/backups"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Контроль бэкапов
                </span>
                <span className="text-[11px] text-slate-400">
                  Журнал резервных копий
                </span>
              </div>
              <span className="text-sm text-slate-400">→</span>
            </Link>
            <Link
              href="/payments"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  Плановые платежи
                </span>
                <span className="text-[11px] text-slate-400">
                  Сроки доменов и серверов
                </span>
              </div>
              <span className="text-xs text-slate-400">→</span>
            </Link>
            <Link
              href="/faq"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  База знаний
                </span>
                <span className="text-[11px] text-slate-400">
                  Инструкции и Markdown-статьи
                </span>
              </div>
              <span className="text-xs text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
