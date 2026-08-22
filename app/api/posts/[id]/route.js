import { NextResponse } from 'next/server';
import { isValidWriterToken } from '@/lib/auth';
import {
  getDynamicPosts,
  saveDynamicPosts,
  markAsDeleted
} from '@/lib/postsStore';

// DELETE /api/posts/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const token = request.headers.get('x-writer-token');
    if (!isValidWriterToken(token)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid writer access token' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Always mark ID in deleted list so built-in and dynamic posts are removed
    await markAsDeleted(id);

    // Also remove from dynamic posts if present
    const posts = await getDynamicPosts();
    const filtered = posts.filter(p => p.id !== id && p.slug !== id);
    if (filtered.length !== posts.length) {
      await saveDynamicPosts(filtered);
    }

    return NextResponse.json({ success: true, message: `Post ${id} deleted successfully` });
  } catch (err) {
    console.error('Delete route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete post' }, { status: 500 });
  }
}
