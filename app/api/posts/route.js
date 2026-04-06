import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const POSTS_KEY = "ryda:posts:v2";

function isAuthorized(req) {
  const token = req.headers.get("x-writer-token");
  const valid = process.env.WRITER_TOKEN;
  return valid && token === valid;
}

export async function GET() {
  try {
    const raw = await kv.lrange(POSTS_KEY, 0, -1);
    const posts = raw
      .map((p) => (typeof p === "string" ? JSON.parse(p) : p))
      .filter((p) => p.published !== false);
    return NextResponse.json({ posts }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, category, author, summary, content, featured_image, tags } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: category?.trim() || "General",
      author: author?.trim() || "RYDA Team",
      summary: summary?.trim() || content.trim().slice(0, 220).replace(/\n/g, " ") + "…",
      content: content.trim(),
      featured_image: featured_image?.trim() || null,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      date: new Date().toISOString(),
      published: true,
    };

    await kv.lpush(POSTS_KEY, JSON.stringify(post));
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Post ID required." }, { status: 400 });

    const all = await kv.lrange(POSTS_KEY, 0, -1);
    const match = all.find((p) => {
      const parsed = typeof p === "string" ? JSON.parse(p) : p;
      return parsed.id === id;
    });

    if (!match) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    await kv.lrem(POSTS_KEY, 0, match);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Post ID required." }, { status: 400 });

    const all = await kv.lrange(POSTS_KEY, 0, -1);
    const idx = all.findIndex((p) => {
      const parsed = typeof p === "string" ? JSON.parse(p) : p;
      return parsed.id === id;
    });

    if (idx === -1) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    const existing = typeof all[idx] === "string" ? JSON.parse(all[idx]) : all[idx];
    const body = await req.json();
    const updated = { ...existing, ...body, id: existing.id, date: existing.date, updated_at: new Date().toISOString() };

    await kv.lset(POSTS_KEY, idx, JSON.stringify(updated));
    return NextResponse.json({ post: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
