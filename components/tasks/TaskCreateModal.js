import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function TaskCreateModal({
  isOpen,
  onClose,
  onCreated,
  organizations,
  users,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [executors, setExecutors] = useState([]);
  const [todoDeadline, setTodoDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [observers, setObservers] = useState([]);

  const toggleExecutor = (userId) => {
    setExecutors((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleObserver = (userId) => {
    setObservers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !company || executors.length === 0) {
      setError(
        'Заполните обязательные поля и выберите хотя бы одного исполнителя',
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          company,
          executors,
          todoDeadline: todoDeadline || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при создании');
      }

      setTitle('');
      setDescription('');
      setCompany('');
      setExecutors([]);
      setTodoDeadline('');
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Новая задача"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {error && (
          <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Тема задачи *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Краткое описание задачи"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Организация *
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
              required
            >
              <option value="">Выберите организацию</option>
              {organizations.map((org) => (
                <option key={org._id} value={org.title}>
                  {org.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Дедлайн
            </label>
            <input
              type="date"
              value={todoDeadline}
              onChange={(e) => setTodoDeadline(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Исполнители
          </label>
          <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={executors.includes(u._id)}
                  onChange={() => toggleExecutor(u._id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-slate-800 font-medium">{u.name}</span>
                <span className="text-xs text-slate-400 hidden">
                  ({u.email})
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Наблюдатели
          </label>
          <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={observers.includes(u._id)}
                  onChange={() => toggleObserver(u._id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-slate-800 font-medium">{u.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Описание
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="Подробности задачи, контакты, адрес..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Создание...' : 'Создать задачу'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
