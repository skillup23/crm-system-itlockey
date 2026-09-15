'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ArticleForm from '@/components/faq/ArticleForm';

export default function EditArticlePage({ params }) {
  const { id } = use(params);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/faq/${id}`);
        const data = await res.json();
        if (!ignore && res.ok) {
          setArticle(data);
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
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Загрузка данных статьи...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Статья не найдена.{' '}
        <Link href="/faq" className="underline">
          Вернуться в базу знаний
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href={`/faq/${id}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Назад к просмотру
        </Link>
      </div>
      <ArticleForm initialData={article} isEditing={true} articleId={id} />
    </div>
  );
}
