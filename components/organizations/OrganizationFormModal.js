import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function OrganizationFormModal({
  isOpen,
  onClose,
  onSave,
  title,
  setTitle,
  users,
  selectedUsers,
  toggleUserSelection,
  isEditing,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Редактировать организацию' : 'Новая организация'}
    >
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Название
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Например: АЗС или ООО Новация"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Доступ для сотрудников
          </label>
          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u._id)}
                  onChange={() => toggleUserSelection(u._id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-slate-800 font-medium">{u.name}</span>
                <span className="text-slate-400 text-xs">({u.email})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" type="submit">
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
