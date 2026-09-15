import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Task from '@/models/Task';

// Получение информации по задаче
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const task = await Task.findOne({ _id: id, isDeleted: false })
    .populate('manager', 'name email')
    .populate('executor', 'name email');

  if (!task) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  return NextResponse.json(task);
}

// Обновление задачи (редактирование, смена статуса)
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
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const isManager = String(task.manager) === session.user.id;

  // Менять постановщика разрешено только текущему постановщику или админу
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
  if (body.executor !== undefined) task.executor = body.executor;
  if (body.status !== undefined) task.status = body.status;
  if (body.todoDeadline !== undefined) {
    task.todoDeadline = body.todoDeadline ? new Date(body.todoDeadline) : null;
  }

  await task.save();

  const updatedTask = await Task.findById(id)
    .populate('manager', 'name email')
    .populate('executor', 'name email');

  return NextResponse.json(updatedTask);
}

// Мягкое удаление (isDeleted: true)
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const task = await Task.findById(id);
  if (!task) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  task.isDeleted = true;
  await task.save();

  return NextResponse.json({ success: true });
}
