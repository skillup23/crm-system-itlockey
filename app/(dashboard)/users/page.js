'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import UserEditModal from '@/components/users/UserEditModal';

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Создание
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Редактирование
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
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
        const res = await fetch('/api/users');
        const data = await res.json();
        if (!ignore) {
          setUsers(Array.isArray(data) ? data : []);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка при создании');

      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setIsOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (session?.user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm">
        Раздел доступен только администраторам системы.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Сотрудники</h1>
          <p className="text-base text-slate-500">
            Управление учетными записями, ролями и доступом команды
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>+ Добавить сотрудника</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Загрузка данных...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 sm:px-6 py-2 sm:py-4">Сотрудник</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4">Email</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4">Роль</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4">Статус</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className={`hover:bg-slate-50/50 transition-colors ${u.isActive === false ? 'opacity-60 bg-slate-50/70' : ''}`}
                  >
                    <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'Администратор' : 'Сотрудник'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          u.isActive === false
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.isActive === false ? 'Заблокирован' : 'Активен'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-right">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors"
                      >
                        Редактировать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модалка создания */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Новый сотрудник"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              ФИО
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Роль
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-500 bg-white"
            >
              <option value="user">Сотрудник</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модалка редактирования */}
      {editingUser && (
        <UserEditModal
          key={editingUser._id}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={fetchUsers}
          user={editingUser}
          currentUserId={session?.user?.id}
        />
      )}
    </div>
  );
}
