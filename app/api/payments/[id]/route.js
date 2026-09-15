import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectMongo();
  const payment = await Payment.findById(id);

  if (!payment) {
    return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const isAuthor = String(payment.author) === session.user.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json(
      { error: 'Нет прав на редактирование' },
      { status: 403 },
    );
  }

  if (body.domen !== undefined) payment.domen = body.domen.trim();
  if (body.registrator !== undefined)
    payment.registrator = body.registrator.trim();
  if (body.datedomen !== undefined)
    payment.datedomen = body.datedomen ? new Date(body.datedomen) : null;
  if (body.hosting !== undefined) payment.hosting = body.hosting.trim();
  if (body.datehosting !== undefined)
    payment.datehosting = body.datehosting ? new Date(body.datehosting) : null;
  if (body.allowedUsers !== undefined) payment.allowedUsers = body.allowedUsers;

  await payment.save();
  return NextResponse.json(payment);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const payment = await Payment.findById(id);
  if (!payment) {
    return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  }

  const isAdmin = session.user.role === 'admin';
  const isAuthor = String(payment.author) === session.user.id;
  if (!isAdmin && !isAuthor) {
    return NextResponse.json(
      { error: 'Нет прав на удаление' },
      { status: 403 },
    );
  }

  await Payment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
