import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Backup from '@/models/Backup';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();

  const filter = {};
  if (session.user.role !== 'admin') {
    filter.$or = [
      { author: session.user.id },
      { allowedUsers: session.user.id },
    ];
  }

  const backups = await Backup.find(filter)
    .populate('author', 'name email')
    .populate('allowedUsers', 'name email')
    .sort({ checkDate: -1 });

  return NextResponse.json(backups);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { server, checkDate, backupDate, comment, status, allowedUsers } =
      await req.json();

    if (!server || !server.trim()) {
      return NextResponse.json(
        { error: 'Укажите название или IP сервера' },
        { status: 400 },
      );
    }

    await connectMongo();

    const newBackup = await Backup.create({
      server: server.trim(),
      checkDate: checkDate ? new Date(checkDate) : new Date(),
      backupDate: backupDate ? new Date(backupDate) : new Date(),
      comment: comment || '',
      status: status || 'Успешно',
      author: session.user.id,
      allowedUsers: allowedUsers || [],
    });

    return NextResponse.json(newBackup, { status: 201 });
  } catch (error) {
    console.error('Ошибка добавления сервера:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
