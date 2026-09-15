'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TaskComments from '@/components/tasks/TaskComments';

export default function TaskDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Режим редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTaskData = async () => {
    try {
      const [taskRes, usersRes, orgsRes] = await Promise.all([
        fetch(`/api/tasks/${id}`),
        fetch('/api/users'),
        fetch('/api/organizations'),
      ]);

      if (!taskRes.ok) throw new Error('Заявка не найдена');

      const taskData = await taskRes.json();
      const usersData = await usersRes.json();
      const orgsData = await orgsRes.json();

      setTask(taskData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);

      setFormData({
        title: taskData.title,
        description: taskData.description || '',
        company: taskData.company,
        status: taskData.status,
        executor: taskData.executor?._id || '',
        manager: taskData.manager?._id || '',
        todoDeadline: taskData.todoDeadline
          ? taskData.todoDeadline.substring(0, 10)
          : '',
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [taskRes, usersRes, orgsRes] = await Promise.all([
          fetch(`/api/tasks/${id}`),
          fetch('/api/users'),
          fetch('/api/organizations'),
        ]);

        if (!taskRes.ok) throw new Error('Заявка не найдена');

        const taskData = await taskRes.json();
        const usersData = await usersRes.json();
        const orgsData = await orgsRes.json();

        if (!ignore) {
          setTask(taskData);
          setUsers(Array.isArray(usersData) ? usersData : []);
          setOrganizations(Array.isArray(orgsData) ? orgsData : []);

          setFormData({
            title: taskData.title,
            description: taskData.description || '',
            company: taskData.company,
            status: taskData.status,
            executor: taskData.executor?._id || '',
            manager: taskData.manager?._id || '',
            todoDeadline: taskData.todoDeadline
              ? taskData.todoDeadline.substring(0, 10)
              : '',
          });
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при сохранении');

      setTask(data);
      setIsEditing(false);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTask(updated);
        setFormData((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/tasks');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Загрузка данных заявки...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Заявка не найдена.{' '}
        <Link href="/tasks" className="text-blue-600 underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  // Проверка права смены постановщика
  const canChangeManager =
    session?.user?.role === 'admin' || session?.user?.id === task.manager?._id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Верхняя навигация и кнопки */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/tasks"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Назад к заявкам
        </Link>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Удалить
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Отменить
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100">
          {errorMessage}
        </div>
      )}

      {/* Основная карточка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая часть: Заголовок, описание, комментарии */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            {isEditing ? (
              <form
                id="task-edit-form"
                onSubmit={handleSave}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Тема заявки
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Описание
                  </label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-extrabold text-slate-900">
                    {task.title}
                  </h1>
                  <StatusBadge status={task.status} />
                </div>
                <div className="prose max-w-none text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {task.description || (
                    <span className="text-slate-400 italic">
                      Описание отсутствует
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Секция комментариев */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <TaskComments
              taskId={task._id}
              comments={task.comments}
              onCommentAdded={fetchTaskData}
            />
          </div>
        </div>

        {/* Правая часть: мета-информация и управление */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              Параметры задачи
            </h3>

            {isEditing ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Открыта">Открыта</option>
                    <option value="В работе">В работе</option>
                    <option value="Ожидание">Ожидание</option>
                    <option value="Закрыта">Закрыта</option>
                    <option value="Архив">Архив</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Организация
                  </label>
                  <select
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    {organizations.map((org) => (
                      <option key={org._id} value={org.title}>
                        {org.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Исполнитель
                  </label>
                  <select
                    value={formData.executor}
                    onChange={(e) =>
                      setFormData({ ...formData, executor: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Постановщик
                  </label>
                  <select
                    value={formData.manager}
                    disabled={!canChangeManager}
                    onChange={(e) =>
                      setFormData({ ...formData, manager: e.target.value })
                    }
                    className={`w-full rounded-lg border border-slate-300 p-2 bg-white ${!canChangeManager ? 'bg-slate-100 cursor-not-allowed text-slate-400' : ''}`}
                  >
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {!canChangeManager && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Меняет только постановщик
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    Дедлайн
                  </label>
                  <input
                    type="date"
                    value={formData.todoDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, todoDeadline: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  form="task-edit-form"
                  disabled={saving}
                  className="w-full mt-2"
                >
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">
                    Быстрая смена статуса
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold bg-white"
                  >
                    <option value="Открыта">Открыта</option>
                    <option value="В работе">В работе</option>
                    <option value="Ожидание">Ожидание</option>
                    <option value="Закрыта">Закрыта</option>
                    <option value="Архив">Архив</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <span className="text-slate-400 block">Организация:</span>
                    <span className="font-semibold text-slate-800">
                      {task.company}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Исполнитель:</span>
                    <span className="font-semibold text-slate-800">
                      {task.executor?.name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Постановщик:</span>
                    <span className="font-semibold text-slate-800">
                      {task.manager?.name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Дедлайн:</span>
                    <span className="font-semibold text-slate-800">
                      {task.todoDeadline
                        ? new Date(task.todoDeadline).toLocaleDateString(
                            'ru-RU',
                          )
                        : 'Не установлен'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Дата создания:</span>
                    <span className="text-slate-600">
                      {new Date(task.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Обновлено:</span>
                    <span className="text-slate-600">
                      {new Date(task.updatedAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Удалить заявку?"
        message="Заявка будет помещена в корзину (мягкое удаление) и перестанет отображаться в списках."
      />
    </div>
  );
}
