'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function TrashTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permanentDeleteId, setPermanentDeleteId] = useState(null);

  const fetchTrash = async () => {
    try {
      const res = await fetch('/api/tasks/trash');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/tasks/trash');
        const data = await res.json();
        if (!ignore) {
          setTasks(Array.isArray(data) ? data : []);
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

  const handleRestore = async (id) => {
    const res = await fetch('/api/tasks/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'restore' }),
    });
    if (res.ok) fetchTrash();
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteId) return;
    const res = await fetch('/api/tasks/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: permanentDeleteId,
        action: 'permanent_delete',
      }),
    });
    if (res.ok) {
      setPermanentDeleteId(null);
      fetchTrash();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Корзина заявок</h1>
          <p className="text-sm text-slate-500">
            Удаленные тикеты: возможность восстановить или стереть навсегда
          </p>
        </div>
        <Link href="/tasks">
          <Button variant="secondary">← Назад к заявкам</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Загрузка корзины...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Корзина пуста
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {task.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {task.company}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>Постановщик: {task.manager?.name || '—'}</span>
                    <span>Исполнитель: {task.executor?.name || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRestore(task._id)}
                  >
                    Восстановить
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setPermanentDeleteId(task._id)}
                  >
                    Удалить навсегда
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!permanentDeleteId}
        onClose={() => setPermanentDeleteId(null)}
        onConfirm={handlePermanentDelete}
        title="Удалить заявку навсегда?"
        message="Это действие сотрет заявку и все ее комментарии из базы данных без возможности восстановления."
      />
    </div>
  );
}
