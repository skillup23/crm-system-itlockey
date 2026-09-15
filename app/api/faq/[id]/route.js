import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import Article from '@/models/Article';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { id } = await params;
  await connectMongo();

  const article = await Article.findById(id);
  if (!article) {
    return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  const { id } = await params;
  const { title, group, content } = await req.json();

  await connectMongo();
  const article = await Article.findById(id);

  if (!article) {
    return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
  }

  if (title) article.title = title.trim();
  if (group) article.group = group.trim().toLowerCase();
  if (content !== undefined) article.content = content;

  await article.save();
  return NextResponse.json(article);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  const { id } = await params;
  await connectMongo();

  await Article.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
