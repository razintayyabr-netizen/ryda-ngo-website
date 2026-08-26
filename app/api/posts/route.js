import { NextResponse } from 'next/server';
import STATIC_NEWS from '@/lib/staticNews';
import { isValidWriterToken } from '@/lib/auth';
import {
  getAllActivePosts,
  getPostByIdOrSlug,
  getDynamicPosts,
  saveDynamicPosts,
  markAsDeleted,
  removeDeletedMark
} from '@/lib/postsStore';

// GET /api/posts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const found = await getPostByIdOrSlug(id);
      if (found) return NextResponse.json(found);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const all = await getAllActivePosts();
    return NextResponse.json(all);
  } catch (err) {
    console.error('GET /api/posts error:', err);
    return NextResponse.json(STATIC_NEWS);
  }
}

// POST /api/posts
export async function POST(request) {
  try {
    const body = await request.json();
    const token = request.headers.get('x-writer-token') || body.token;

    if (!isValidWriterToken(token)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid writer access token' }, { status: 401 });
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

    if (!isValidWriterToken(token)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid writer access token' }, { status: 401 });
    }

    const { id, title, category, author, summary, content, featured_image, images, tags } = body;
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // If post was marked deleted previously, unmark it
    await removeDeletedMark(id);

    const posts = await getDynamicPosts();
    let idx = posts.findIndex(p => p.id === id || p.slug === id);

    if (idx === -1) {
      // If it exists in STATIC_NEWS, clone it into dynamic posts
      const staticPost = STATIC_NEWS.find(p => p.id === id || p.slug === id);
      if (staticPost) {
        posts.unshift({ ...staticPost });
        idx = 0;
      } else {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
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
      featured_image: primaryUrl,
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

// DELETE /api/posts (handles /api/posts?id=... or body { id })
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    let body = {};
    try {
      body = await request.json();
    } catch {}

    id = id || body.id;
    const token = request.headers.get('x-writer-token') || body.token;

    if (!isValidWriterToken(token)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid writer access token' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await markAsDeleted(id);

    return NextResponse.json({ success: true, message: `Post ${id} deleted successfully`, id });
  } catch (err) {
    console.error('Delete /api/posts error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete post' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Writer-Token, Content-Type',
    },
  });
}

