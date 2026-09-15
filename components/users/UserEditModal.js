import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function UserEditModal({
  isOpen,
  onClose,
  onUpdated,
  user,
  currentUserId,
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'user');
  const [isActive, setIsActive] = useState(user?.isActive !== false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          isActive,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');

      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSelf = user?._id === currentUserId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Редактирование: ${user?.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            ФИО
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Роль
            </label>
            <select
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white disabled:bg-slate-100"
            >
              <option value="user">Сотрудник</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Статус доступа
            </label>
            <select
              value={isActive ? 'active' : 'blocked'}
              disabled={isSelf}
              onChange={(e) => setIsActive(e.target.value === 'active')}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white disabled:bg-slate-100"
            >
              <option value="active">Активен</option>
              <option value="blocked">Заблокирован</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            Новый пароль{' '}
            <span className="font-normal text-slate-400 lowercase">
              (оставь пустым, если не меняется)
            </span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Введите новый пароль"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
