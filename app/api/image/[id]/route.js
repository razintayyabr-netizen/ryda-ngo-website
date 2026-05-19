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

export async function GET(request, { params }) {
  const { id } = params;
  const r = await getRedis();
  if (!r) {
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 500 });
  }

  const dataUrl = await r.get(`ryda:image:${id}`);
  if (!dataUrl) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  // dataUrl format: data:image/jpeg;base64,xxxxx
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
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
