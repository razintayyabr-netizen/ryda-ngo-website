import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import STATIC_NEWS from '@/lib/staticNews';

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

// GET /api/posts
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const dynamicPosts = await getDynamicPosts();
    const found = dynamicPosts.find(p => p.id === id) || STATIC_NEWS.find(p => p.id === id);
    if (found) return NextResponse.json(found);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const dynamicPosts = await getDynamicPosts();
  const all = [...dynamicPosts, ...STATIC_NEWS]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return NextResponse.json(all);
}

// POST /api/posts
export async function POST(request) {
  try {
    const body = await request.json();
    const token = request.headers.get('x-writer-token') || body.token;

    if (token !== 'RYDA5555' && token !== process.env.WRITER_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, category, author, summary, content, featured_image, images, tags } = body;

    if (!title || !summary || !content) {
      return NextResponse.json({ error: 'Title, summary, and content are required' }, { status: 400 });
    }

    let imageList = Array.isArray(images)
      ? images.map(img => {
          if (typeof img === 'string') return { url: img, caption: '', credit: '' };
          return { url: img?.url || '', caption: img?.caption || '', credit: img?.credit || '' };
        }).filter(img => img.url)
      : [];
    if (!imageList.length && featured_image) {
      const featUrl = typeof featured_image === 'string' ? featured_image : (featured_image?.url || '');
      if (featUrl) imageList = [{ url: featUrl, caption: featured_image?.caption || '', credit: featured_image?.credit || '' }];
    }
    const primaryUrl = typeof featured_image === 'string' ? featured_image : (featured_image?.url || (imageList.length > 0 ? imageList[0].url : null));

    const id = 'post-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();
    const post = {
      id,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36),
      category: category || 'Article',
      author: author || 'RYDA Team',
      summary,
      content,
      featured_image: primaryUrl,
      images: imageList,
      tags: tags || [],
      date: now,
      createdAt: now,
      published: true,
    };

    const posts = await getDynamicPosts();
    posts.unshift(post);
    await saveDynamicPosts(posts);

    return NextResponse.json({ success: true, post, id });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// PUT /api/posts
export async function PUT(request) {
  try {
    const body = await request.json();
    const token = request.headers.get('x-writer-token') || body.token;

    if (token !== 'RYDA5555' && token !== process.env.WRITER_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, category, author, summary, content, featured_image, images, tags } = body;
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const posts = await getDynamicPosts();
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let imageList = Array.isArray(images)
      ? images.map(img => {
          if (typeof img === 'string') return { url: img, caption: '', credit: '' };
          return { url: img?.url || '', caption: img?.caption || '', credit: img?.credit || '' };
        }).filter(img => img.url)
      : (posts[idx].images || []);

    if (!imageList.length && featured_image) {
      const featUrl = typeof featured_image === 'string' ? featured_image : (featured_image?.url || '');
      if (featUrl) imageList = [{ url: featUrl, caption: featured_image?.caption || '', credit: featured_image?.credit || '' }];
    }
    const primaryUrl = featured_image !== undefined
      ? (typeof featured_image === 'string' ? featured_image : (featured_image?.url || null))
      : (imageList.length > 0 ? imageList[0].url : posts[idx].featured_image);

    posts[idx] = {
      ...posts[idx],
      title: title || posts[idx].title,
      category: category || posts[idx].category,
      author: author || posts[idx].author,
      summary: summary || posts[idx].summary,
      content: content || posts[idx].content,
      featured_image: primaryImage,
      images: imageList,
      tags: tags || posts[idx].tags,
      updatedAt: new Date().toISOString(),
    };

    await saveDynamicPosts(posts);
    return NextResponse.json({ success: true, post: posts[idx] });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

