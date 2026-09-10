import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();
  // Отдаем id, имя, email и роль (без паролей)
  const users = await User.find({}, '_id name email role').sort({ name: 1 });
  return NextResponse.json(users);
}
