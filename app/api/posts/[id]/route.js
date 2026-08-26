import { NextResponse } from 'next/server';
import { isValidWriterToken } from '@/lib/auth';
import {
  getPostByIdOrSlug,
  markAsDeleted
} from '@/lib/postsStore';

// GET /api/posts/[id]
export async function GET(request, { params }) {
  try {
    const rawId = params?.id || '';
    const id = decodeURIComponent(rawId);
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await getPostByIdOrSlug(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err) {
    console.error('GET /api/posts/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]
export async function DELETE(request, { params }) {
  try {
    const rawId = params?.id || '';
    const id = decodeURIComponent(rawId);
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('x-writer-token') || searchParams.get('token');

    if (!isValidWriterToken(token)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid writer access token' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await markAsDeleted(id);

    return NextResponse.json({ success: true, message: `Post "${id}" deleted successfully`, id });
  } catch (err) {
    console.error('Delete route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete post' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Writer-Token, Content-Type',
    },
  });
}

