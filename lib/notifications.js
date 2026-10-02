import Notification from '@/models/Notification';

/**
 * Создает уведомления для целевых пользователей и держит пул не более 10 штук на человека.
 */
export async function notifyUsers({
  recipients,
  actorId,
  actorName,
  taskId,
  taskTitle,
  actionType,
  message,
}) {
  try {
    // Убираем автора действия и дубликаты ID
    const uniqueRecipients = [
      ...new Set(
        recipients
          .map((r) => String(r?._id || r))
          .filter((id) => id && id !== String(actorId)),
      ),
    ];

    if (uniqueRecipients.length === 0) return;

    for (const recipientId of uniqueRecipients) {
      // 1. Создаем новое уведомление
      await Notification.create({
        recipient: recipientId,
        actor: actorId,
        actorName,
        task: taskId,
        taskTitle,
        actionType,
        message,
        isRead: false,
      });

      // 2. Держим лимит в 10 уведомлений: находим ID, которые нужно удалить
      const userNotifications = await Notification.find({
        recipient: recipientId,
      })
        .sort({ createdAt: -1 })
        .select('_id')
        .lean();

      if (userNotifications.length > 10) {
        const idsToDelete = userNotifications.slice(10).map((n) => n._id);
        await Notification.deleteMany({ _id: { $in: idsToDelete } });
      }
    }
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
  }
}
