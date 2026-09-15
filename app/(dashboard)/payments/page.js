'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PaymentFormModal from '@/components/payments/PaymentFormModal';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Сортировка: 'nearest' | 'domain'
  const [sortBy, setSortBy] = useState('nearest');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPayments = async () => {
    try {
      const [payRes, userRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/users'),
      ]);
      const payData = await payRes.json();
      const userData = await userRes.json();

      setPayments(Array.isArray(payData) ? payData : []);
      setUsers(Array.isArray(userData) ? userData : []);
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
        const [payRes, userRes] = await Promise.all([
          fetch('/api/payments'),
          fetch('/api/users'),
        ]);
        const payData = await payRes.json();
        const userData = await userRes.json();

        if (!ignore) {
          setPayments(Array.isArray(payData) ? payData : []);
          setUsers(Array.isArray(userData) ? userData : []);
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

  const getNearestDate = (p) => {
    const dates = [];
    if (p.datedomen) dates.push(new Date(p.datedomen));
    if (p.datehosting) dates.push(new Date(p.datehosting));
    if (dates.length === 0) return null;
    return new Date(Math.min(...dates));
  };

  const getDateBadge = (date) => {
    if (!date) return <span className="text-slate-400">—</span>;

    const now = new Date();
    const target = new Date(date);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    let style = 'bg-slate-50 text-slate-700 border-slate-200';
    let label = target.toLocaleDateString('ru-RU');

    if (diffDays < 0) {
      style = 'bg-red-50 text-red-700 border-red-200 font-bold';
      label += ` (просрочено)`;
    } else if (diffDays <= 14) {
      style = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      label += ` (${diffDays} дн.)`;
    }

    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs border ${style}`}
      >
        {label}
      </span>
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/payments/${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteId(null);
      fetchPayments();
    }
  };

  // Фильтрация и сортировка
  const filteredPayments = payments
    .filter(
      (p) =>
        p.domen.toLowerCase().includes(search.toLowerCase()) ||
        p.hosting?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === 'domain') return a.domen.localeCompare(b.domen);
      const dateA = getNearestDate(a)?.getTime() || Infinity;
      const dateB = getNearestDate(b)?.getTime() || Infinity;
      return dateA - dateB;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Плановые платежи
          </h1>
          <p className="text-base text-slate-500">
            Контроль сроков действия и своевременной оплаты доменов и серверов
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPayment(null);
            setIsModalOpen(true);
          }}
        >
          + Добавить сервис
        </Button>
      </div>

      {/* Панель фильтрации */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Поиск по домену или хостингу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
        />

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 bg-white"
          >
            <option value="nearest">По ближайшей оплате</option>
            <option value="domain">По имени домена</option>
          </select>
        </div>
      </div>

      {/* Таблица платежей */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Загрузка данных...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Записей не найдено
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Доменное имя</th>
                  <th className="px-5 py-3.5">Регистратор / Срок</th>
                  <th className="px-5 py-3.5">Хостинг / Срок</th>
                  <th className="px-5 py-3.5">Автор</th>
                  <th className="px-5 py-3.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-base">
                      {item.domen}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-base">
                      <div>{item.registrator || '—'}</div>
                      <div className="mt-1">{getDateBadge(item.datedomen)}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-base">
                      <div>{item.hosting || '—'}</div>
                      <div className="mt-1">
                        {getDateBadge(item.datehosting)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-base">
                      {item.author?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingPayment(item);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <PaymentFormModal
          key={editingPayment?._id || 'new'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchPayments}
          payment={editingPayment}
          users={users}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить запись о платеже?"
        message="Запись будет безвозвратно удалена из таблицы расходов."
      />
    </div>
  );
}
