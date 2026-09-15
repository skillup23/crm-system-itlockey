import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Article from '@/models/Article';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  await connectMongo();

  const { searchParams } = new URL(req.url);
  const group = searchParams.get('group');
  const search = searchParams.get('search');

  const filter = {};
  if (group) filter.group = group;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const articles = await Article.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(articles);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Только администратор может добавлять статьи' },
      { status: 403 },
    );
  }

  try {
    const { title, group, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Заголовок и текст обязательны' },
        { status: 400 },
      );
    }

    await connectMongo();

    const article = await Article.create({
      title: title.trim(),
      group: (group || 'other').trim().toLowerCase(),
      content,
      authorName: session.user.name,
      createdBy: session.user.id,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Ошибка сохранения статьи' },
      { status: 500 },
    );
  }
}
