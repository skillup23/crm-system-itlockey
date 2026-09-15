import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();

  const filter = {};
  if (session.user.role !== 'admin') {
    filter.$or = [
      { author: session.user.id },
      { allowedUsers: session.user.id },
    ];
  }

  const payments = await Payment.find(filter)
    .populate('author', 'name email')
    .populate('allowedUsers', 'name email')
    .sort({ createdAt: -1 });

  return NextResponse.json(payments);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const {
      domen,
      registrator,
      datedomen,
      hosting,
      datehosting,
      allowedUsers,
    } = await req.json();

    if (!domen || !domen.trim()) {
      return NextResponse.json(
        { error: 'Укажите доменное имя' },
        { status: 400 },
      );
    }

    await connectMongo();

    const payment = await Payment.create({
      domen: domen.trim(),
      registrator: registrator || '',
      datedomen: datedomen ? new Date(datedomen) : null,
      hosting: hosting || '',
      datehosting: datehosting ? new Date(datehosting) : null,
      author: session.user.id,
      allowedUsers: allowedUsers || [],
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
