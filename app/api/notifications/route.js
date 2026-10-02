import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Notification from '@/models/Notification';

// Получить последние 10 уведомлений текущего пользователя
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();

  const userId = session.user.id || session.user._id;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return NextResponse.json({ notifications, unreadCount });
}

// Пометить как прочитанное (одно или все сразу)
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();

  const userId = session.user.id || session.user._id;
  const { notificationId } = await req.json();

  if (notificationId) {
    // Пометить конкретное
    await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true } },
    );
  } else {
    // Пометить все уведомления пользователя как прочитанные
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );
  }

  return NextResponse.json({ success: true });
}
