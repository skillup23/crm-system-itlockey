import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const task = await Task.findOne({ _id: id, isDeleted: false })
    .populate('manager', 'name email')
    .populate('executors', 'name email')
    .populate('observers', 'name email');

  if (!task)
    return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });

  const isAdmin = session.user.role === 'admin';
  const isManager =
    String(task.manager?._id || task.manager) === session.user.id;
  const isExecutor = task.executors?.some(
    (u) => String(u._id || u) === session.user.id,
  );
  const isObserver = task.observers?.some(
    (u) => String(u._id || u) === session.user.id,
  );

  // Доступ закрыт, если не админ, не постановщик и не один из исполнителей
  if (!isAdmin && !isManager && !isExecutor && !isObserver) {
    return NextResponse.json({ error: 'Доступ закрыт' }, { status: 403 });
  }

  return NextResponse.json(task);
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectMongo();
  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const isManager = String(task.manager) === session.user.id;
  const isExecutor = task.executors?.some((u) => String(u) === session.user.id);
  const isObserver = task.observers?.some((u) => String(u) === session.user.id);

  if (!isAdmin && !isManager && !isExecutor) {
    return NextResponse.json(
      { error: 'Наблюдатели не могут редактировать задачу' },
      { status: 403 },
    );
  }

  if (body.manager && String(body.manager) !== String(task.manager)) {
    if (!isAdmin && !isManager) {
      return NextResponse.json(
        { error: 'Постановщика может изменять только сам постановщик' },
        { status: 403 },
      );
    }
    task.manager = body.manager;
  }

  if (body.title !== undefined) task.title = body.title.trim();
  if (body.description !== undefined) task.description = body.description;
  if (body.company !== undefined) task.company = body.company;
  if (body.executors !== undefined) task.executors = body.executors;
  if (body.observers !== undefined) task.observers = body.observers;
  if (body.status !== undefined) task.status = body.status;
  if (body.todoDeadline !== undefined) {
    task.todoDeadline = body.todoDeadline ? new Date(body.todoDeadline) : null;
  }

  await task.save();

  const updatedTask = await Task.findById(id)
    .populate('manager', 'name email')
    .populate('executors', 'name email')
    .populate('observers', 'name email');

  return NextResponse.json(updatedTask);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const task = await Task.findById(id);
  if (!task) {
    return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const isManager = String(task.manager) === session.user.id;

  if (!isAdmin && !isManager) {
    return NextResponse.json(
      { error: 'Удалять задачу может только постановщик или администратор' },
      { status: 403 },
    );
  }

  task.isDeleted = true;
  await task.save();

  return NextResponse.json({ success: true });
}
