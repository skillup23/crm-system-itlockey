'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import TaskCreateModal from '@/components/tasks/TaskCreateModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Фильтры
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [company, setCompany] = useState('');
  const [executor, setExecutor] = useState('');
  const [manager, setManager] = useState('');
  const [isArchive, setIsArchive] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (company) params.set('company', company);
      if (executor) params.set('executor', executor);
      if (manager) params.set('manager', manager);
      if (isArchive) params.set('archive', 'true');

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки задач:', err);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const [orgRes, userRes] = await Promise.all([
          fetch('/api/organizations'),
          fetch('/api/users'),
        ]);
        const orgData = await orgRes.json();
        const userData = await userRes.json();

        if (!ignore) {
          setOrganizations(Array.isArray(orgData) ? orgData : []);
          setUsers(Array.isArray(userData) ? userData : []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadTasks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (company) params.set('company', company);
        if (executor) params.set('executor', executor);
        if (manager) params.set('manager', manager);
        if (isArchive) params.set('archive', 'true');

        const res = await fetch(`/api/tasks?${params.toString()}`);
        const data = await res.json();
        if (!ignore) {
          setTasks(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) setLoading(false);
      }
    }

    loadTasks();
    return () => {
      ignore = true;
    };
  }, [search, status, company, executor, manager, isArchive]);

  // Функция определения дедлайна для цветовой подсветки
  const getDeadlineStatus = (deadline, taskStatus) => {
    if (!deadline || taskStatus === 'Закрыта' || taskStatus === 'Архив')
      return null;

    const now = new Date();
    const target = new Date(deadline);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        border: 'border-l-red-500 bg-red-50/20',
        text: 'text-red-600',
        label: 'Просрочено',
      };
    }
    if (diffDays <= 3) {
      return {
        border: 'border-l-amber-500 bg-amber-50/20',
        text: 'text-amber-600',
        label: `Осталось ${diffDays} дн.`,
      };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isArchive ? 'Архив задач' : 'Задачи'}
          </h1>
          <p className="text-base text-slate-500">
            {isArchive
              ? 'Список завершенных и заархивированных задач'
              : 'Текущие задачи и обращения клиентов'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tasks/trash">
            <Button variant="secondary" className="cursor-pointer">
              Корзина
            </Button>
          </Link>
          <Button
            variant={isArchive ? 'primary' : 'secondary'}
            onClick={() => setIsArchive(!isArchive)}
            className="cursor-pointer"
          >
            {isArchive ? 'К активным задачам' : 'Открыть архив'}
          </Button>
          {!isArchive && (
            <Button
              variant="primary"
              onClick={() => setIsCreateOpen(true)}
              className="cursor-pointer"
            >
              + Добавить задачу
            </Button>
          )}
        </div>
      </div>

      {/* Блок фильтров и поиска */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Поиск по теме, тексту, комментариям..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 lg:col-span-2"
          />

          {!isArchive && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Все статусы</option>
              <option value="Открыта">Открыта</option>
              <option value="В работе">В работе</option>
              <option value="Ожидание">Ожидание</option>
              <option value="Закрыта">Закрыта</option>
            </select>
          )}

          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          >
            <option value="">Все организации</option>
            {organizations.map((org) => (
              <option key={org._id} value={org.title}>
                {org.title}
              </option>
            ))}
          </select>

          <select
            value={executor}
            onChange={(e) => setExecutor(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
          >
            <option value="">Все исполнители</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Список карточек задач */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm">
            Загрузка задач...
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500 shadow-sm">
            Задач не найдено
          </div>
        ) : (
          tasks.map((task) => {
            const deadlineAlert = getDeadlineStatus(
              task.todoDeadline,
              task.status,
            );

            return (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                className={`block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all border-l-4 ${
                  deadlineAlert ? deadlineAlert.border : 'border-l-transparent'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">
                        {task.title}
                      </span>
                      <span className="text-sm px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {task.company}
                      </span>
                      <StatusBadge status={task.status} />
                      {deadlineAlert && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded bg-white border border-current ${deadlineAlert.text}`}
                        >
                          {deadlineAlert.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {task.description || 'Без описания'}
                    </p>
                  </div>

                  {/* Мета-информация */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 self-start md:self-auto">
                    <div>
                      <span className="text-slate-400">Исполнители: </span>
                      <span className="font-medium text-slate-700">
                        {task.executors?.length > 0
                          ? task.executors.map((e) => e.name).join(', ')
                          : 'Не назначены'}
                      </span>
                    </div>
                    {task.todoDeadline && (
                      <div>
                        <span className="text-slate-400">Дедлайн: </span>
                        <span className="font-medium text-slate-700">
                          {new Date(task.todoDeadline).toLocaleDateString(
                            'ru-RU',
                          )}
                        </span>
                      </div>
                    )}
                    {task.comments?.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-400">
                        💬 {task.comments.length}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Модальное окно создания задачи */}
      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchTasks}
        organizations={organizations}
        users={users}
      />
    </div>
  );
}
