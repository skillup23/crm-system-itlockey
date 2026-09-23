import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function PaymentFormModal({
  isOpen,
  onClose,
  onSaved,
  payment = null,
  users = [],
}) {
  const [domen, setDomen] = useState(payment?.domen || '');
  const [registrator, setRegistrator] = useState(payment?.registrator || '');
  const [datedomen, setDatedomen] = useState(
    payment?.datedomen ? payment.datedomen.substring(0, 10) : '',
  );
  const [hosting, setHosting] = useState(payment?.hosting || '');
  const [datehosting, setDatehosting] = useState(
    payment?.datehosting ? payment.datehosting.substring(0, 10) : '',
  );
  const [allowedUsers, setAllowedUsers] = useState(
    payment?.allowedUsers?.map((u) => u._id || u) || [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleUser = (userId) => {
    setAllowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domen.trim()) {
      setError('Укажите домен');
      return;
    }

    setLoading(true);
    setError('');

    const url = payment ? `/api/payments/${payment._id}` : '/api/payments';
    const method = payment ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domen,
          registrator,
          datedomen: datedomen || null,
          hosting,
          datehosting: datehosting || null,
          allowedUsers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');

      onSaved();
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
      title={
        payment ? `Редактирование: ${payment.domen}` : 'Новый сервис / домен'
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            Домен *
          </label>
          <input
            type="text"
            value={domen}
            onChange={(e) => setDomen(e.target.value)}
            placeholder="msu-yug.ru"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Регистратор домена
            </label>
            <input
              type="text"
              value={registrator}
              onChange={(e) => setRegistrator(e.target.value)}
              placeholder="reg.ru / beget"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Оплата домена до
            </label>
            <input
              type="date"
              value={datedomen}
              onChange={(e) => setDatedomen(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Хостинг / Сервер
            </label>
            <input
              type="text"
              value={hosting}
              onChange={(e) => setHosting(e.target.value)}
              placeholder="Timeweb / Selectel"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Оплата хостинга до
            </label>
            <input
              type="date"
              value={datehosting}
              onChange={(e) => setDatehosting(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            Доступ сотрудникам
          </label>
          <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={allowedUsers.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span className="text-slate-800 font-medium">{u.name}</span>
                <span className="text-slate-400 hidden">({u.email})</span>
              </label>
            ))}
          </div>
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
