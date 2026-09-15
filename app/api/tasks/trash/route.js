import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Task from '@/models/Task';

// Получение списка задач из корзины (isDeleted: true)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();
  const deletedTasks = await Task.find({ isDeleted: true })
    .populate('manager', 'name email')
    .populate('executor', 'name email')
    .sort({ updatedAt: -1 });

  return NextResponse.json(deletedTasks);
}

// Восстановление или окончательное удаление
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id, action } = await req.json(); // action: 'restore' | 'permanent_delete'
  await connectMongo();

  if (action === 'restore') {
    await Task.findByIdAndUpdate(id, { isDeleted: false });
    return NextResponse.json({
      success: true,
      message: 'Заявка восстановлена',
    });
  }

  if (action === 'permanent_delete') {
    await Task.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: 'Заявка удалена навсегда',
    });
  }

  return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 });
}
