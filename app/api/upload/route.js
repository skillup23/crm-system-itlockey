import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadToS3 } from '@/lib/s3';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не прикреплен' },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileUrl = await uploadToS3(buffer, file.name, file.type);

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Ошибка загрузки в S3:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить файл в хранилище' },
      { status: 500 },
    );
  }
}
