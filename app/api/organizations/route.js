import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Organization from '@/models/Organization';

// Получение списка организаций
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();

  const { searchParams } = new URL(req.url);
  const showAll =
    searchParams.get('showAll') === 'true' && session.user.role === 'admin';

  const filter = {};
  if (!showAll) {
    // Видно только где пользователь указан в allowedUsers (или где список пуст)
    filter.$or = [
      { allowedUsers: session.user.id },
      { allowedUsers: { $size: 0 } },
      { allowedUsers: { $exists: false } },
    ];
  }

  const organizations = await Organization.find(filter)
    .populate('allowedUsers', 'name email')
    .sort({ title: 1 });

  return NextResponse.json(organizations);
}

// Создание новой организации
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { title, allowedUsers } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Название обязательно' },
        { status: 400 },
      );
    }

    await connectMongo();

    const newOrg = await Organization.create({
      title: title.trim(),
      allowedUsers: allowedUsers || [],
      createdBy: session.user.id,
    });

    return NextResponse.json(newOrg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при создании' }, { status: 500 });
  }
}
