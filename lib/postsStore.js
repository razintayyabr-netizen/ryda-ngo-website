import { createClient } from 'redis';
import STATIC_NEWS from './staticNews';

let redis = null;
let redisPromise = null;

export async function getRedis() {
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
const DELETED_POSTS_KEY = 'ryda:deleted_posts';

if (!globalThis._rydaMemoryDeleted) {
  globalThis._rydaMemoryDeleted = new Set();
}
if (!globalThis._rydaMemoryPosts) {
  globalThis._rydaMemoryPosts = [];
}

export async function getDeletedIds() {
  try {
    const r = await getRedis();
    if (!r) return Array.from(globalThis._rydaMemoryDeleted);
    const raw = await r.get(DELETED_POSTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.from(new Set([...list, ...globalThis._rydaMemoryDeleted]));
  } catch (e) {
    console.error('Redis read deleted error:', e);
    return Array.from(globalThis._rydaMemoryDeleted);
  }
}

export async function markAsDeleted(id) {
  if (!id) return;
  globalThis._rydaMemoryDeleted.add(id);
  try {
    const r = await getRedis();
    if (!r) return;
    const current = await getDeletedIds();
    if (!current.includes(id)) {
      current.push(id);
    }
    await r.set(DELETED_POSTS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Redis save deleted error:', e);
  }
}

export async function removeDeletedMark(id) {
  if (!id) return;
  globalThis._rydaMemoryDeleted.delete(id);
  try {
    const r = await getRedis();
    if (!r) return;
    const current = await getDeletedIds();
    const filtered = current.filter(d => d !== id);
    await r.set(DELETED_POSTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Redis remove deleted error:', e);
  }
}

export async function getDynamicPosts() {
  try {
    const r = await getRedis();
    if (!r) return globalThis._rydaMemoryPosts;
    const raw = await r.get(POSTS_KEY);
    if (!raw) return globalThis._rydaMemoryPosts;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Redis read error:', e);
    return globalThis._rydaMemoryPosts;
  }
}

export async function saveDynamicPosts(posts) {
  globalThis._rydaMemoryPosts = posts;
  try {
    const r = await getRedis();
    if (!r) return;
    await r.set(POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Redis write error:', e);
  }
}

export async function getAllActivePosts() {
  const deletedIds = await getDeletedIds();
  const dynamicPosts = await getDynamicPosts();

  const activeDynamic = dynamicPosts.filter(p => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));
  const activeStatic = STATIC_NEWS.filter(p => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));

  const seenIds = new Set();
  const seenSlugs = new Set();
  const all = [];

  for (const post of activeDynamic) {
    if (post.id) seenIds.add(post.id);
    if (post.slug) seenSlugs.add(post.slug);
    all.push(post);
  }

  for (const post of activeStatic) {
    if (!seenIds.has(post.id) && (!post.slug || !seenSlugs.has(post.slug))) {
      seenIds.add(post.id);
      if (post.slug) seenSlugs.add(post.slug);
      all.push(post);
    }
  }

  all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return all;
}

export async function getPostByIdOrSlug(idOrSlug) {
  const deletedIds = await getDeletedIds();
  if (deletedIds.includes(idOrSlug)) return null;

  const dynamicPosts = await getDynamicPosts();
  const activeDynamic = dynamicPosts.filter(p => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));
  const foundDynamic = activeDynamic.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  if (foundDynamic) return foundDynamic;

  const activeStatic = STATIC_NEWS.filter(p => !deletedIds.includes(p.id) && !deletedIds.includes(p.slug));
  const foundStatic = activeStatic.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  return foundStatic || null;
}
