// api/posts.js — RYDA Blog Posts API
// Uses Vercel KV (Redis) for persistent storage.
// Setup: Create a KV store in your Vercel dashboard and link it to this project.
// Env vars needed: KV_REST_API_URL, KV_REST_API_TOKEN (auto-set by Vercel), WRITER_TOKEN

import { kv } from "@vercel/kv";

const POSTS_KEY = "ryda:posts:v2";

function cors(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Writer-Token,Content-Type");
}

function isAuthorized(req) {
  const token = req.headers["x-writer-token"];
  const valid = process.env.WRITER_TOKEN;
  return valid && token === valid;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // ── GET /api/posts — public, returns all published posts ──────────────
    if (req.method === "GET") {
      const raw = await kv.lrange(POSTS_KEY, 0, -1);
      const posts = raw
        .map((p) => (typeof p === "string" ? JSON.parse(p) : p))
        .filter((p) => p.published !== false);
      return res.status(200).json({ posts });
    }

    // ── POST /api/posts — create new post (auth required) ────────────────
    if (req.method === "POST") {
      if (!isAuthorized(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, category, author, summary, content, featured_image, tags } = req.body || {};

      if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({ error: "Title and content are required." });
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
      return res.status(201).json({ post });
    }

    // ── DELETE /api/posts?id=xyz — delete post (auth required) ───────────
    if (req.method === "DELETE") {
      if (!isAuthorized(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Post ID required." });

      const all = await kv.lrange(POSTS_KEY, 0, -1);
      const match = all.find((p) => {
        const parsed = typeof p === "string" ? JSON.parse(p) : p;
        return parsed.id === id;
      });

      if (!match) return res.status(404).json({ error: "Post not found." });
      await kv.lrem(POSTS_KEY, 0, match);
      return res.status(200).json({ success: true });
    }

    // ── PUT /api/posts?id=xyz — update post (auth required) ──────────────
    if (req.method === "PUT") {
      if (!isAuthorized(req)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Post ID required." });

      const all = await kv.lrange(POSTS_KEY, 0, -1);
      const idx = all.findIndex((p) => {
        const parsed = typeof p === "string" ? JSON.parse(p) : p;
        return parsed.id === id;
      });

      if (idx === -1) return res.status(404).json({ error: "Post not found." });

      const existing = typeof all[idx] === "string" ? JSON.parse(all[idx]) : all[idx];
      const updated = { ...existing, ...req.body, id: existing.id, date: existing.date, updated_at: new Date().toISOString() };

      await kv.lset(POSTS_KEY, idx, JSON.stringify(updated));
      return res.status(200).json({ post: updated });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error.", details: err.message });
  }
}
