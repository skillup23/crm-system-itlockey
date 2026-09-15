import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function BackupFormModal({
  isOpen,
  onClose,
  onSaved,
  backup = null,
  users = [],
}) {
  const [server, setServer] = useState(backup?.server || '');
  const [checkDate, setCheckDate] = useState(
    backup?.checkDate
      ? backup.checkDate.substring(0, 10)
      : new Date().toISOString().substring(0, 10),
  );
  const [backupDate, setBackupDate] = useState(
    backup?.backupDate
      ? backup.backupDate.substring(0, 10)
      : new Date().toISOString().substring(0, 10),
  );
  const [status, setStatus] = useState(backup?.status || 'Успешно');
  const [comment, setComment] = useState(backup?.comment || '');
  const [allowedUsers, setAllowedUsers] = useState(
    backup?.allowedUsers?.map((u) => u._id || u) || [],
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
    if (!server.trim()) {
      setError('Укажите сервер');
      return;
    }

    setLoading(true);
    setError('');

    const url = backup ? `/api/backups/${backup._id}` : '/api/backups';
    const method = backup ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server,
          checkDate,
          backupDate,
          status,
          comment,
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
        backup ? `Проверка: ${backup.server}` : 'Добавить сервер на контроль'
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
            Сервер / Сервис *
          </label>
          <input
            type="text"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            placeholder="SRV-1C-MAIN (192.168.1.10) или DB-PROD"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Дата проверки
            </label>
            <input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white"
              required
            />
          </div>
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Дата последнего бэкапа
            </label>
            <input
              type="date"
              value={backupDate}
              onChange={(e) => setBackupDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            Статус проверки
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500 bg-white"
          >
            <option value="Успешно">Успешно</option>
            <option value="Внимание">Внимание (размер/задержка)</option>
            <option value="Ошибка">Ошибка (нет бэкапа/сбой)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            Комментарий / Детали
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Размер архива 42GB, сохранен на NAS и выгружен на S3..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-slate-500 mb-1">
            Доступ сотрудникам
          </label>
          <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-2 p-1 rounded hover:bg-slate-50 cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={allowedUsers.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span className="text-slate-800 font-medium">{u.name}</span>
                <span className="text-slate-400">({u.email})</span>
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
