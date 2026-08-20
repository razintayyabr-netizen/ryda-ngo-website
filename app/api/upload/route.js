import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import { saveInMemoryImage } from '@/lib/imageStore';
import { isValidWriterToken } from '@/lib/auth';

let redis = null;
let redisPromise = null;

async function getRedis() {
  if (redis && redis.isOpen) return redis;
  if (!process.env.REDIS_URL) return null;
  if (!redisPromise) {
    redisPromise = (async () => {
      try {
        redis = createClient({ url: process.env.REDIS_URL });
        redis.on('error', (err) => console.error('Redis client error:', err));
        await redis.connect();
        return redis;
      } catch (e) {
        console.error('Redis connect error:', e);
        redisPromise = null;
        return null;
      }
    })();
  }
  return redisPromise;
}

// Max image size: 6MB
const MAX_SIZE = 6 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token');

    if (!isValidWriterToken(token)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid writer access token' }, { status: 401 });
    }

    let files = formData.getAll('files');
    if (!files || files.length === 0) {
      const singleFile = formData.get('file');
      if (singleFile) files = [singleFile];
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const urls = [];
    const r = await getRedis();

    for (const file of files) {
      if (typeof file === 'string') continue;
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `File "${file.name}" has unsupported type. Only JPG, PNG, WebP, GIF allowed.` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File "${file.name}" exceeds 6MB limit.` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      const imgId = 'img-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);

      // Save to Redis if available
      if (r) {
        try {
          await r.set(`ryda:image:${imgId}`, dataUrl);
          await r.expire(`ryda:image:${imgId}`, 180 * 24 * 60 * 60); // 180 days
        } catch (redisErr) {
          console.warn('Redis write failed, using in-memory store:', redisErr);
          saveInMemoryImage(imgId, dataUrl);
        }
      } else {
        saveInMemoryImage(imgId, dataUrl);
      }

      urls.push(`/api/image/${imgId}.jpg`);
    }

    return NextResponse.json({
      success: true,
      url: urls[0],
      urls,
      count: urls.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}
