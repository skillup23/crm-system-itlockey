import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Удалить',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-3 pt-3">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
