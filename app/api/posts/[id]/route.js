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

const POSTS_KEY = 'ryda:posts';

async function getDynamicPosts() {
  try {
    const r = await getRedis();
    if (!r) return [];
    const raw = await r.get(POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Redis read error:', e);
    return [];
  }
}

async function saveDynamicPosts(posts) {
  try {
    const r = await getRedis();
    if (!r) return;
    await r.set(POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Redis write error:', e);
  }
}

// DELETE /api/posts/[id]
export async function DELETE(request, { params }) {
  const { id } = params;
  const token = request.headers.get('x-writer-token');
  if (token !== 'RYDA5555' && token !== process.env.WRITER_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (id.startsWith('nr-')) {
    return NextResponse.json({ error: 'Cannot delete built-in posts' }, { status: 400 });
  }
  const posts = await getDynamicPosts();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  await saveDynamicPosts(filtered);
  return NextResponse.json({ success: true });
}
