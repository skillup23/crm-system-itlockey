import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Backup from '@/models/Backup';

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectMongo();
  const item = await Backup.findById(id);

  if (!item) {
    return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const isAuthor = String(item.author) === session.user.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json(
      { error: 'Нет прав на редактирование' },
      { status: 403 },
    );
  }

  if (body.server !== undefined) item.server = body.server.trim();
  if (body.checkDate !== undefined) item.checkDate = new Date(body.checkDate);
  if (body.backupDate !== undefined)
    item.backupDate = new Date(body.backupDate);
  if (body.comment !== undefined) item.comment = body.comment.trim();
  if (body.status !== undefined) item.status = body.status;
  if (body.allowedUsers !== undefined) item.allowedUsers = body.allowedUsers;

  await item.save();
  return NextResponse.json(item);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const item = await Backup.findById(id);
  if (!item) {
    return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const isAuthor = String(item.author) === session.user.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json(
      { error: 'Нет прав на удаление' },
      { status: 403 },
    );
  }

  await Backup.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
