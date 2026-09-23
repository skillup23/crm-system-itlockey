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
  const showAll =
    searchParams.get('showAll') === 'true' && session.user.role === 'admin';

  const filter = { isDeleted: false };

  // Ограничение прав: обычные сотрудники видят только задачи, где они постановщик или входят в executors
  // Если не админ с включенным showAll, показываем только связанные задачи:
  // где пользователь менеджер, исполнитель или наблюдатель
  if (!showAll) {
    filter.$or = [
      { manager: session.user.id },
      { executors: session.user.id },
      { observers: session.user.id },
    ];
  }

  // Фильтр архива
  if (isArchive) {
    filter.status = 'Архив';
  } else if (status) {
    filter.status = status;
  } else {
    filter.status = { $ne: 'Архив' };
  }

  if (company) filter.company = company;
  if (manager) filter.manager = manager;

  // Фильтр по исполнителю из выпадающего списка
  if (executor) {
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { executors: executor }];
      delete filter.$or;
    } else {
      filter.executors = executor;
    }
  }

  if (search.trim()) {
    const searchConditions = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { 'comments.text': { $regex: search.trim(), $options: 'i' } },
    ];

    if (filter.$and) {
      filter.$and.push({ $or: searchConditions });
    } else if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
      delete filter.$or;
    } else {
      filter.$or = searchConditions;
    }
  }

  const tasks = await Task.find(filter)
    .populate('manager', 'name email')
    .populate('executors', 'name email')
    .populate('observers', 'name email')
    .sort({ createdAt: -1 });

  return NextResponse.json(tasks);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { title, description, company, executors, todoDeadline } =
      await req.json();

    if (!title || !company || !executors || executors.length === 0) {
      return NextResponse.json(
        {
          error:
            'Заполните обязательные поля и укажите хотя бы одного исполнителя',
        },
        { status: 400 },
      );
    }

    await connectMongo();

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      company: company.trim(),
      executors: Array.isArray(executors) ? executors : [executors],
      observers: Array.isArray(observers) ? observers : [],
      manager: session.user.id,
      todoDeadline: todoDeadline ? new Date(todoDeadline) : null,
      status: 'Открыта',
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
