import Link from 'next/link';
import ArticleForm from '@/components/faq/ArticleForm';

export default function NewArticlePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/faq"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          ← Назад к базе знаний
        </Link>
      </div>
      <ArticleForm />
    </div>
  );
}
