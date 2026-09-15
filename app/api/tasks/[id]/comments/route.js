import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Task from '@/models/Task';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  const { text } = await req.json();

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: 'Комментарий не может быть пустым' },
      { status: 400 },
    );
  }

  await connectMongo();
  const task = await Task.findOne({ _id: id, isDeleted: false });

  if (!task) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  const newComment = {
    text: text.trim(),
    author: session.user.id,
    authorName: session.user.name || 'Сотрудник',
    createdAt: new Date(),
  };

  task.comments.push(newComment);
  await task.save();

  return NextResponse.json(newComment, { status: 201 });
}
