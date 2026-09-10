import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const company = searchParams.get('company') || '';
  const executor = searchParams.get('executor') || '';
  const manager = searchParams.get('manager') || '';
  const isArchive = searchParams.get('archive') === 'true';

  const filter = { isDeleted: false };

  // Фильтр архива: на обычном дашборде архив скрыт
  if (isArchive) {
    filter.status = 'Архив';
  } else if (status) {
    filter.status = status;
  } else {
    filter.status = { $ne: 'Архив' };
  }

  if (company) filter.company = company;
  if (executor) filter.executor = executor;
  if (manager) filter.manager = manager;

  if (search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { 'comments.text': { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const tasks = await Task.find(filter)
    .populate('manager', 'name email')
    .populate('executor', 'name email')
    .sort({ createdAt: -1 });

  return NextResponse.json(tasks);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { title, description, company, executor, todoDeadline } =
      await req.json();

    if (!title || !company || !executor) {
      return NextResponse.json(
        { error: 'Заполните обязательные поля' },
        { status: 400 },
      );
    }

    await connectMongo();

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      company: company.trim(),
      executor,
      manager: session.user.id,
      todoDeadline: todoDeadline ? new Date(todoDeadline) : null,
      status: 'Открыта',
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
