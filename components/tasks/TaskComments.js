import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function TaskComments({
  taskId,
  comments = [],
  onCommentAdded,
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        setText('');
        onCommentAdded();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
        Комментарии{' '}
        <span className="text-xs font-normal text-slate-400">
          ({comments.length})
        </span>
      </h3>

      {/* Список комментариев */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            Пока нет ни одного комментария
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-slate-50 border border-slate-200/75 rounded-xl p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {comment.authorName}
                </span>
                <span className="text-slate-400">
                  {new Date(comment.createdAt).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Форма отправки */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-2">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Оставить комментарий к заявке..."
          className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        />
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </div>
      </form>
    </div>
  );
}
