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
    const file = formData.get('file');
    const token = formData.get('token');

    if (token !== 'RYDA5555' && token !== process.env.WRITER_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, or GIF allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image must be under 2MB' }, { status: 400 });
    }

    // Convert to data URL and store in Redis (publicly accessible as static file)
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Store in Redis with a key that expires after 90 days (auto-cleanup)
    const r = await getRedis();
    if (!r) {
      return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 });
    }

    const imgId = 'img-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    await r.set(`ryda:image:${imgId}`, dataUrl);
    await r.expire(`ryda:image:${imgId}`, 90 * 24 * 60 * 60); // 90 days

    return NextResponse.json({
      success: true,
      url: `/api/image/${imgId}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
