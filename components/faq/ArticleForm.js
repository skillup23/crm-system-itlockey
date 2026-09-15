'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function ArticleForm({
  initialData = {},
  isEditing = false,
  articleId = null,
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title || '');
  const [group, setGroup] = useState(initialData.group || 'other');
  const [content, setContent] = useState(initialData.content || '');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');

      const markdownImage = `\n![${file.name}](${data.url})\n`;
      setContent((prev) => prev + markdownImage);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const url = isEditing ? `/api/faq/${articleId}` : '/api/faq';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, group, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');

      router.push(`/faq/${isEditing ? articleId : data._id}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <h1 className="text-xl font-bold text-slate-900">
        {isEditing ? 'Редактирование статьи' : 'Создание статьи Markdown'}
      </h1>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Заголовок статьи
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Настройка WireGuard VPN"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Группа / Категория
            </label>
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="network, server, other..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Контент (Markdown)
            </label>
            <label className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>
                📎 {uploading ? 'Загрузка фото...' : 'Прикрепить скриншот в S3'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Заголовок&#10;&#10;Описание шагов...&#10;&#10;```bash&#10;sudo apt update&#10;```"
            className="w-full font-mono rounded-lg border border-slate-300 p-3.5 text-xs outline-none focus:border-blue-500 leading-relaxed"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            type="button"
            onClick={() => router.back()}
          >
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting
              ? 'Сохранение...'
              : isEditing
                ? 'Сохранить изменения'
                : 'Опубликовать статью'}
          </Button>
        </div>
      </form>
    </div>
  );
}
