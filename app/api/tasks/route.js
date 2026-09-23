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
    const body = await req.json();
    const { title, description, company, executors, observers, todoDeadline } =
      body;

    // Проверяем обязательные поля
    if (!title || !company) {
      return NextResponse.json(
        { error: 'Заполните тему задачи и укажите организацию' },
        { status: 400 },
      );
    }

    if (!executors || (Array.isArray(executors) && executors.length === 0)) {
      return NextResponse.json(
        { error: 'Выберите хотя бы одного исполнителя' },
        { status: 400 },
      );
    }

    await connectMongo();

    // Безопасное определение ID постановщика (session.user.id или session.user._id)
    const managerId = session.user.id || session.user._id;
    if (!managerId) {
      console.error(
        'Ошибка: session.user.id отсутствует в сессии',
        session.user,
      );
      return NextResponse.json(
        {
          error:
            'Не удалось определить пользователя. Попробуйте перелогиниться',
        },
        { status: 400 },
      );
    }

    // Фильтруем пустые элементы в массивах
    const cleanExecutors = (
      Array.isArray(executors) ? executors : [executors]
    ).filter(Boolean);
    const cleanObservers = (Array.isArray(observers) ? observers : []).filter(
      Boolean,
    );

    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      company: company.trim(),
      executors: cleanExecutors,
      observers: cleanObservers,
      manager: managerId,
      status: 'Открыта',
      isDeleted: false,
    };

    if (todoDeadline) {
      taskData.todoDeadline = new Date(todoDeadline);
    }

    const task = await Task.create(taskData);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    // В терминале сервера сразу отобразится точная причина ошибки
    console.error('Критическая ошибка в POST /api/tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
