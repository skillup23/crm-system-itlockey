import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Organization from '@/models/Organization';

// Редактирование
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  const { title, allowedUsers } = await req.json();

  await connectMongo();
  const org = await Organization.findById(id);

  if (!org) {
    return NextResponse.json(
      { error: 'Организация не найдена' },
      { status: 404 },
    );
  }

  // Проверка прав: админ или автор записи
  if (
    session.user.role !== 'admin' &&
    String(org.createdBy) !== session.user.id
  ) {
    return NextResponse.json(
      { error: 'Нет прав на редактирование' },
      { status: 403 },
    );
  }

  org.title = title.trim();
  org.allowedUsers = allowedUsers || [];
  await org.save();

  return NextResponse.json(org);
}

// Удаление
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const org = await Organization.findById(id);
  if (!org) {
    return NextResponse.json(
      { error: 'Организация не найдена' },
      { status: 404 },
    );
  }

  if (
    session.user.role !== 'admin' &&
    String(org.createdBy) !== session.user.id
  ) {
    return NextResponse.json(
      { error: 'Нет прав на удаление' },
      { status: 403 },
    );
  }

  await Organization.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
