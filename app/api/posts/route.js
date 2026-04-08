import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const POSTS_KEY = "ryda:posts:v2";
let redisClient = null;

async function getRedis() {
  if (!redisClient) {
    const url = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL;
    if (!url) throw new Error("REDIS_URL not found.");
    redisClient = createClient({ url });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }
  return redisClient;
}

function isAuthorized(req) {
  const token = req.headers.get("x-writer-token");
  const valid = process.env.WRITER_TOKEN;
  return valid && token === valid;
}

// Helper to safely parse Redis values
function parsePost(p) {
  if (!p) return null;
  try {
    return typeof p === "string" ? JSON.parse(p) : p;
  } catch (e) {
    console.error("Failed to parse post:", p);
    return null;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const client = await getRedis();

    const raw = await client.lRange(POSTS_KEY, 0, -1);
    
    if (id) {
      const match = raw.find(p => {
        const parsed = parsePost(p);
        return parsed && parsed.id === id;
      });

      if (!match) return NextResponse.json({ error: "Post not found." }, { status: 404 });
      return NextResponse.json({ post: parsePost(match) }, { status: 200 });
    }

    const posts = raw
      .map(p => parsePost(p))
      .filter((p) => p && p.published !== false);

    return NextResponse.json({ posts }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Service unavailable." }, { status: 500 });
  }
}

export async function POST(req) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, category, author, summary, content, featured_image, tags } = body;

    const post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: category?.trim() || "General",
      author: author?.trim() || "RYDA Team",
      summary: summary?.trim() || (content ? content.replace(/<[^>]*>/g, '').slice(0, 200) + "..." : ""),
      content: content || "",
      featured_image: featured_image?.trim() || null,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      date: new Date().toISOString(),
      published: true,
    };

    const client = await getRedis();
    await client.lPush(POSTS_KEY, JSON.stringify(post));
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ error: "Failed to save post." }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const client = await getRedis();
    const all = await client.lRange(POSTS_KEY, 0, -1);
    const match = all.find(p => parsePost(p)?.id === id);
    if (!match) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    await client.lRem(POSTS_KEY, 0, match);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const client = await getRedis();
    const all = await client.lRange(POSTS_KEY, 0, -1);
    const idx = all.findIndex(p => parsePost(p)?.id === id);
    if (idx === -1) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    const existing = parsePost(all[idx]);
    const body = await req.json();
    const updated = { ...existing, ...body, id: existing.id, date: existing.date, updated_at: new Date().toISOString() };
    await client.lSet(POSTS_KEY, idx, JSON.stringify(updated));
    return NextResponse.json({ post: updated }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
