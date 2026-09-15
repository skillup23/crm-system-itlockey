import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  const { id } = await params;
  const { name, email, role, isActive, newPassword } = await req.json();

  await connectMongo();

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json(
      { error: 'Пользователь не найден' },
      { status: 404 },
    );
  }

  // Защита: админ не может заблокировать сам себя или снять с себя админку
  if (session.user.id === id) {
    if (isActive === false) {
      return NextResponse.json(
        { error: 'Вы не можете заблокировать собственный аккаунт' },
        { status: 400 },
      );
    }
    if (role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Вы не можете понизить собственную роль' },
        { status: 400 },
      );
    }
  }

  if (name) user.name = name.trim();
  if (email) user.email = email.toLowerCase().trim();
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  // Если админ передал новый пароль — хешируем и сохраняем
  if (newPassword && newPassword.trim()) {
    user.password = await bcrypt.hash(newPassword.trim(), 10);
  }

  await user.save();

  return NextResponse.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });
}
