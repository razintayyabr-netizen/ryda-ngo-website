import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import { getInMemoryImage } from '@/lib/imageStore';

let redis = null;
let redisPromise = null;

async function getRedis() {
  if (redis && redis.isOpen) return redis;
  const url = process.env.REDIS_URL || process.env.KV_URL;
  if (!url) return null;
  if (!redisPromise) {
    redisPromise = (async () => {
      try {
        redis = createClient({ url });
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

export async function GET(request, { params }) {
  const rawId = params.id || '';
  const id = rawId.replace(/\.(jpg|jpeg|png|webp|gif|avif)$/i, '');

  let dataUrl = null;

  try {
    const r = await getRedis();
    if (r) {
      dataUrl = await r.get(`ryda:image:${id}`);
    }
  } catch (e) {
    console.warn('Redis read failed:', e);
  }

  // Fallback to in-memory store
  if (!dataUrl) {
    dataUrl = getInMemoryImage(id);
  }

  if (!dataUrl) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 500 });
  }

  const contentType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
