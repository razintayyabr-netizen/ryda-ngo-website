import { NextResponse } from 'next/server';
import { createClient } from 'redis';

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

// Max image size: 2MB (after base64 encoding, fits comfortably in Redis)
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token');

    if (token !== 'RYDA5555' && token !== process.env.WRITER_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let files = formData.getAll('files');
    if (!files || files.length === 0) {
      const singleFile = formData.get('file');
      if (singleFile) files = [singleFile];
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const r = await getRedis();
    if (!r) {
      return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const urls = [];

    for (const file of files) {
      if (typeof file === 'string') continue;
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `File ${file.name} is invalid type. Only JPG, PNG, WebP, GIF allowed.` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File ${file.name} exceeds 2MB limit.` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      const imgId = 'img-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
      await r.set(`ryda:image:${imgId}`, dataUrl);
      await r.expire(`ryda:image:${imgId}`, 90 * 24 * 60 * 60);

      urls.push(`/api/image/${imgId}.jpg`);
    }

    return NextResponse.json({
      success: true,
      url: urls[0],
      urls,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

