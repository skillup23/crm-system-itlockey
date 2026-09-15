'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BackupFormModal from '@/components/backups/BackupFormModal';

export default function BackupsPage() {
  const [backups, setBackups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBackup, setEditingBackup] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchBackups = async () => {
    try {
      const [bRes, uRes] = await Promise.all([
        fetch('/api/backups'),
        fetch('/api/users'),
      ]);
      const bData = await bRes.json();
      const uData = await uRes.json();

      setBackups(Array.isArray(bData) ? bData : []);
      setUsers(Array.isArray(uData) ? uData : []);
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
        const [bRes, uRes] = await Promise.all([
          fetch('/api/backups'),
          fetch('/api/users'),
        ]);
        const bData = await bRes.json();
        const uData = await uRes.json();

        if (!ignore) {
          setBackups(Array.isArray(bData) ? bData : []);
          setUsers(Array.isArray(uData) ? uData : []);
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

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/backups/${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleteId(null);
      fetchBackups();
    }
  };

  // Проверка свежести ревизии: если больше 7 дней назад — предупреждение
  const getCheckDateBadge = (date) => {
    if (!date) return <span className="text-slate-400">—</span>;

    const now = new Date();
    const checked = new Date(date);
    const diffDays = Math.floor((now - checked) / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      return (
        <span className="text-red-600 font-bold flex items-center gap-1">
          {checked.toLocaleDateString('ru-RU')}
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 border border-red-200">
            {diffDays}д назад
          </span>
        </span>
      );
    }

    return <span>{checked.toLocaleDateString('ru-RU')}</span>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      Успешно: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Внимание: 'bg-amber-50 text-amber-700 border-amber-200',
      Ошибка: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles['Успешно']}`}
      >
        {status}
      </span>
    );
  };

  const filteredBackups = backups.filter(
    (b) =>
      b.server.toLowerCase().includes(search.toLowerCase()) ||
      b.comment?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Контроль бэкапов
          </h1>
          <p className="text-slate-500 text-base">
            Регулярная сверка и журнал состояния резервных копий серверов
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBackup(null);
            setIsModalOpen(true);
          }}
        >
          + Добавить сервер
        </Button>
      </div>

      {/* Панель поиска */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Поиск по серверу или комментарию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* Таблица серверов и бэкапов */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Загрузка данных...
          </div>
        ) : filteredBackups.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Записей мониторинга нет
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Сервер / Ресурс</th>
                  <th className="px-5 py-3.5">Статус</th>
                  <th className="px-5 py-3.5">Дата проверки</th>
                  <th className="px-5 py-3.5">Дата бэкапа</th>
                  <th className="px-5 py-3.5">Комментарий</th>
                  <th className="px-5 py-3.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBackups.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-base">
                      {item.server}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-base">
                      {getCheckDateBadge(item.checkDate)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-base">
                      {new Date(item.backupDate).toLocaleDateString('ru-RU')}
                    </td>
                    <td
                      className="px-5 py-3.5 text-slate-600 max-w-xs truncate"
                      title={item.comment}
                    >
                      {item.comment || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingBackup(item);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-base"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="text-red-500 hover:text-red-700 font-medium transition-colors text-base"
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
        <BackupFormModal
          key={editingBackup?._id || 'new'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchBackups}
          backup={editingBackup}
          users={users}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить запись о бэкапе?"
        message="Запись мониторинга сервера будет удалена."
      />
    </div>
  );
}
