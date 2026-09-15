'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function FAQPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedGroup !== 'all') params.set('group', selectedGroup);
        if (search.trim()) params.set('search', search.trim());

        const res = await fetch(`/api/faq?${params.toString()}`);
        const data = await res.json();
        if (!ignore) {
          setArticles(Array.isArray(data) ? data : []);
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
  }, [selectedGroup, search]);

  const groups = ['all', ...Array.from(new Set(articles.map((a) => a.group)))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">База знаний IT</h1>
          <p className="text-base text-slate-500">
            Инструкции, документация по серверам и типовые регламенты
          </p>
        </div>
        {session?.user?.role === 'admin' && (
          <Link href="/faq/new">
            <Button variant="primary" className="cursor-pointer">
              + Написать статью
            </Button>
          </Link>
        )}
      </div>

      {/* Панель поиска и фильтрации по категориям */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                selectedGroup === grp
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grp === 'all' ? 'Все категории' : grp}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Поиск по статьям..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* Сетка статей */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm">
          Загрузка статей базы знаний...
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500 shadow-sm">
          Статей пока нет.{' '}
          {session?.user?.role === 'admin' &&
            'Нажмите кнопку выше, чтобы создать первую инструкцию.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <Link
              key={art._id}
              href={`/faq/${art._id}`}
              className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                  {art.group}
                </span>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base line-clamp-2">
                  {art.title}
                </h3>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-4">
                <span>{art.authorName}</span>
                <span>
                  {new Date(art.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
