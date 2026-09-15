import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'ru-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true, // Необходимо для MinIO и большинства российских S3
});

export async function uploadToS3(fileBuffer, fileName, contentType) {
  const uniqueName = `faq/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: uniqueName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Формируем публичный URL
  const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, '');
  return `${endpoint}/${process.env.S3_BUCKET}/${uniqueName}`;
}
