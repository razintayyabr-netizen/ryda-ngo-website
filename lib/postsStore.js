import { createClient } from 'redis';
import STATIC_NEWS from './staticNews';

let redis = null;
let redisPromise = null;

export async function getRedis() {
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
    const set = new Set([...list, ...globalThis._rydaMemoryDeleted]);
    return Array.from(set);
  } catch (e) {
    console.error('Redis read deleted error:', e);
    return Array.from(globalThis._rydaMemoryDeleted);
  }
}

export async function markAsDeleted(idOrSlug) {
  if (!idOrSlug) return;
  const cleanKey = String(idOrSlug).trim();
  if (!cleanKey) return;

  const dynamicPosts = await getDynamicPosts();
  const foundDynamic = dynamicPosts.find(p => p.id === cleanKey || p.slug === cleanKey);
  const foundStatic = STATIC_NEWS.find(p => p.id === cleanKey || p.slug === cleanKey);
  const targetPost = foundDynamic || foundStatic;

  const idsToMark = new Set([cleanKey]);
  if (targetPost) {
    if (targetPost.id) idsToMark.add(targetPost.id);
    if (targetPost.slug) idsToMark.add(targetPost.slug);
  }

  for (const k of idsToMark) {
    globalThis._rydaMemoryDeleted.add(k);
  }

  try {
    const r = await getRedis();
    if (r) {
      const current = await getDeletedIds();
      for (const k of idsToMark) {
        if (!current.includes(k)) current.push(k);
      }
      await r.set(DELETED_POSTS_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Redis save deleted error:', e);
  }

  // Also remove from dynamic posts if present
  const filtered = dynamicPosts.filter(p => !idsToMark.has(p.id) && !idsToMark.has(p.slug));
  if (filtered.length !== dynamicPosts.length) {
    await saveDynamicPosts(filtered);
  }
}

export async function removeDeletedMark(idOrSlug) {
  if (!idOrSlug) return;
  const cleanKey = String(idOrSlug).trim();
  globalThis._rydaMemoryDeleted.delete(cleanKey);
  try {
    const r = await getRedis();
    if (!r) return;
    const current = await getDeletedIds();
    const filtered = current.filter(d => d !== cleanKey);
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
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      globalThis._rydaMemoryPosts = parsed;
      return parsed;
    }
    return globalThis._rydaMemoryPosts;
  } catch (e) {
    console.error('Redis read error:', e);
    return globalThis._rydaMemoryPosts;
  }
}

export async function saveDynamicPosts(posts) {
  globalThis._rydaMemoryPosts = Array.isArray(posts) ? posts : [];
  try {
    const r = await getRedis();
    if (!r) return;
    await r.set(POSTS_KEY, JSON.stringify(globalThis._rydaMemoryPosts));
  } catch (e) {
    console.error('Redis write error:', e);
  }
}

export async function getAllActivePosts() {
  const deletedIds = await getDeletedIds();
  const deletedSet = new Set(deletedIds.map(d => String(d).toLowerCase().trim()));
  const dynamicPosts = await getDynamicPosts();

  const isDeleted = (p) => {
    if (!p) return true;
    if (p.id && deletedSet.has(String(p.id).toLowerCase().trim())) return true;
    if (p.slug && deletedSet.has(String(p.slug).toLowerCase().trim())) return true;
    return false;
  };

  const activeDynamic = dynamicPosts.filter(p => !isDeleted(p));
  const activeStatic = STATIC_NEWS.filter(p => !isDeleted(p));

  const seenIds = new Set();
  const seenSlugs = new Set();
  const seenTitles = new Set();
  const all = [];

  const normalizeTitle = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const post of activeDynamic) {
    if (post.id) seenIds.add(String(post.id).toLowerCase());
    if (post.slug) seenSlugs.add(String(post.slug).toLowerCase());
    if (post.title) seenTitles.add(normalizeTitle(post.title));
    all.push(post);
  }

  for (const post of activeStatic) {
    const pId = post.id ? String(post.id).toLowerCase() : '';
    const pSlug = post.slug ? String(post.slug).toLowerCase() : '';
    const pTitle = normalizeTitle(post.title);

    if (!seenIds.has(pId) && (!pSlug || !seenSlugs.has(pSlug)) && (!pTitle || !seenTitles.has(pTitle))) {
      if (pId) seenIds.add(pId);
      if (pSlug) seenSlugs.add(pSlug);
      if (pTitle) seenTitles.add(pTitle);
      all.push(post);
    }
  }

  all.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  return all;
}

export async function getPostByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  const clean = String(idOrSlug).toLowerCase().trim();
  const deletedIds = await getDeletedIds();
  const deletedSet = new Set(deletedIds.map(d => String(d).toLowerCase().trim()));

  if (deletedSet.has(clean)) return null;

  const dynamicPosts = await getDynamicPosts();
  const foundDynamic = dynamicPosts.find(p => 
    (p.id && String(p.id).toLowerCase().trim() === clean) || 
    (p.slug && String(p.slug).toLowerCase().trim() === clean)
  );

  if (foundDynamic) {
    if (deletedSet.has(String(foundDynamic.id).toLowerCase()) || (foundDynamic.slug && deletedSet.has(String(foundDynamic.slug).toLowerCase()))) {
      return null;
    }
    return foundDynamic;
  }

  const foundStatic = STATIC_NEWS.find(p => 
    (p.id && String(p.id).toLowerCase().trim() === clean) || 
    (p.slug && String(p.slug).toLowerCase().trim() === clean)
  );

  if (foundStatic) {
    if (deletedSet.has(String(foundStatic.id).toLowerCase()) || (foundStatic.slug && deletedSet.has(String(foundStatic.slug).toLowerCase()))) {
      return null;
    }
    return foundStatic;
  }

  return null;
}

