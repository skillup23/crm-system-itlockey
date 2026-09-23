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

      if (taskRes.status === 403) {
        throw new Error('Доступ закрыт');
      }

      if (!taskRes.ok) throw new Error('Задача не найдена');

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
        executors: taskData.executors?.map((u) => u._id || u) || [],
        manager: taskData.manager?._id || '',
        todoDeadline: taskData.todoDeadline
          ? taskData.todoDeadline.substring(0, 10)
          : '',
        observers: taskData.observers?.map((u) => u._id || u) || [],
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

        if (taskRes.status === 403) {
          throw new Error('Доступ закрыт');
        }

        if (!taskRes.ok) throw new Error('Задача не найдена');

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
            executors: taskData.executors?.map((u) => u._id || u) || [],
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

  const toggleObserverEdit = (userId) => {
    setFormData((prev) => {
      const current = prev.observers || [];
      const updated = current.includes(userId)
        ? current.filter((uid) => uid !== userId)
        : [...current, userId];
      return { ...prev, observers: updated };
    });
  };

  const toggleExecutorEdit = (userId) => {
    setFormData((prev) => {
      const current = prev.executors || [];
      const updated = current.includes(userId)
        ? current.filter((uid) => uid !== userId)
        : [...current, userId];
      return { ...prev, executors: updated };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.executors || formData.executors.length === 0) {
      setErrorMessage('Укажите хотя бы одного исполнителя');
      return;
    }

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
        Загрузка данных задачи...
      </div>
    );
  }

  // Экран закрытого доступа
  if (errorMessage === 'Доступ закрыт') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
        <div className="text-3xl">🚫</div>
        <h2 className="text-lg font-bold text-slate-900">Доступ закрыт</h2>
        <p className="text-sm text-slate-500">
          У вас нет прав для просмотра этой задачи.
        </p>
        <div>
          <Link
            href="/tasks"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Вернуться к Задачам
          </Link>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Задача не найдена.{' '}
        <Link href="/tasks" className="text-blue-600 underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  const canChangeManager =
    session?.user?.role === 'admin' || session?.user?.id === task.manager?._id;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Верхняя навигация и кнопки */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/tasks"
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Назад к задачам
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
        <div className="p-3.5 text-sm bg-red-50 text-red-600 rounded-xl border border-red-100">
          {errorMessage}
        </div>
      )}

      {/* Основная карточка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая часть: Тема, описание, комментарии */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            {isEditing ? (
              <form
                id="task-edit-form"
                onSubmit={handleSave}
                className="space-y-4 text-sm"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Тема задачи *
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
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-xs uppercase">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-sm"
                  >
                    <option value="Открыта">Открыта</option>
                    <option value="В работе">В работе</option>
                    <option value="Ожидание">Ожидание</option>
                    <option value="Закрыта">Закрыта</option>
                    <option value="Архив">Архив</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-xs uppercase">
                    Организация
                  </label>
                  <select
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-sm"
                  >
                    {organizations.map((org) => (
                      <option key={org._id} value={org.title}>
                        {org.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-xs uppercase">
                    Исполнители *
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                    {users.map((u) => (
                      <label
                        key={u._id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.executors?.includes(u._id)}
                          onChange={() => toggleExecutorEdit(u._id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-slate-800 font-medium">
                          {u.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-xs uppercase">
                    Постановщик
                  </label>
                  <select
                    value={formData.manager}
                    disabled={!canChangeManager}
                    onChange={(e) =>
                      setFormData({ ...formData, manager: e.target.value })
                    }
                    className={`w-full rounded-lg border border-slate-300 p-2.5 bg-white text-sm ${
                      !canChangeManager
                        ? 'bg-slate-100 cursor-not-allowed text-slate-400'
                        : ''
                    }`}
                  >
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {!canChangeManager && (
                    <span className="text-xs text-slate-400 mt-1 block">
                      Меняет только постановщик
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 text-xs block">
                    Наблюдатели:
                  </span>
                  <div className="font-semibold text-slate-800 space-y-0.5 mt-0.5">
                    {task.observers?.length > 0 ? (
                      task.observers.map((o) => <div key={o._id}>{o.name}</div>)
                    ) : (
                      <span className="text-slate-400 font-normal">
                        Не назначены
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-xs uppercase">
                    Дедлайн
                  </label>
                  <input
                    type="date"
                    value={formData.todoDeadline}
                    onChange={(e) =>
                      setFormData({ ...formData, todoDeadline: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-sm"
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
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-400 block mb-1 text-xs uppercase font-semibold">
                    Быстрая смена статуса
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-semibold bg-white"
                  >
                    <option value="Открыта">Открыта</option>
                    <option value="В работе">В работе</option>
                    <option value="Ожидание">Ожидание</option>
                    <option value="Закрыта">Закрыта</option>
                    <option value="Архив">Архив</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <span className="text-slate-400 text-xs block">
                      Организация:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {task.company}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">
                      Исполнители:
                    </span>
                    <div className="font-semibold text-slate-800 space-y-0.5 mt-0.5">
                      {task.executors?.length > 0 ? (
                        task.executors.map((e) => (
                          <div key={e._id}>{e.name}</div>
                        ))
                      ) : (
                        <span className="text-slate-400 font-normal">
                          Не назначены
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">
                      Постановщик:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {task.manager?.name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">
                      Дедлайн:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {task.todoDeadline
                        ? new Date(task.todoDeadline).toLocaleDateString(
                            'ru-RU',
                          )
                        : 'Не установлен'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">
                      Дата создания:
                    </span>
                    <span className="text-slate-600 text-xs">
                      {new Date(task.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">
                      Обновлено:
                    </span>
                    <span className="text-slate-600 text-xs">
                      {new Date(task.updatedAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Удалить задачу?"
        message="Задача будет помещена в корзину (мягкое удаление) и перестанет отображаться в списках."
      />
    </div>
  );
}
