'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ArticleViewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

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

  const handleDelete = async () => {
    const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/faq');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Загрузка статьи...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Статья не найдена.{' '}
        <Link href="/faq" className="underline">
          Вернуться в список
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/faq"
          className="text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Все статьи
        </Link>
        {session?.user?.role === 'admin' && (
          <div className="flex items-center gap-2">
            <Link href={`/faq/${id}/edit`}>
              <Button
                variant="secondary"
                size="sm"
                className="cursor-pointer text-sm"
              >
                Редактировать
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              className="cursor-pointer text-sm"
              onClick={() => setShowDelete(true)}
            >
              Удалить статью
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-5 space-y-2">
          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            {article.group}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-400 pt-1">
            <span>Автор: {article.authorName}</span>
            <span>
              Опубликовано:{' '}
              {new Date(article.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        {/* Markdown рендеринг */}
        <div className="prose max-w-none text-sm text-slate-800 leading-relaxed space-y-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-slate-900 mt-6 mb-3">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold text-slate-900 mt-5 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-slate-900 mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 text-sm text-slate-700 leading-normal">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 my-2 text-slate-700">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 my-2 text-slate-700">
                  {children}
                </ol>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="px-1.5 py-0.5 bg-slate-100 text-pink-600 rounded text-xs font-mono">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-3">
                    <code>{children}</code>
                  </pre>
                ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="rounded-xl border border-slate-200 max-w-full h-auto my-4 shadow-sm"
                />
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {children}
                </a>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Удалить статью?"
        message="Статья будет удалена из базы знаний без возможности восстановления."
      />
    </div>
  );
}
