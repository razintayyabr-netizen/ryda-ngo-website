/* ============================================================
   RYDA — Views & Audience Analytics Store
   Redis-backed (with in-memory fallback) counters for:
   - Article views + unique readers (per article, HyperLogLog)
   - Site page views + unique visitors
   - Writer panel (backend) visits
   - Daily trend, referrers, countries, devices
   ============================================================ */
import { getRedis } from './postsStore.js';

const P = 'ryda:an:';
const DAY_TTL = 60 * 60 * 24 * 120; // keep daily buckets for 120 days

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|whatsapp|telegrambot|discord|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http/i;

export function isBot(ua = '') {
  if (!ua) return true;
  return BOT_RE.test(ua);
}

export function detectDevice(ua = '') {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobi|android|iphone|ipod|opera mini|iemobile/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function cleanField(v, max = 120) {
  return String(v || '').replace(/[\r\n\t]/g, '').trim().slice(0, max);
}

// ─── In-memory fallback (used when Redis isn't configured) ──
if (!globalThis._rydaAnalytics) {
  globalThis._rydaAnalytics = { hashes: {}, sets: {} };
}
const mem = globalThis._rydaAnalytics;
const memIncr = (key, field, by = 1) => {
  mem.hashes[key] = mem.hashes[key] || {};
  mem.hashes[key][field] = (mem.hashes[key][field] || 0) + by;
  return mem.hashes[key][field];
};
const memAdd = (key, member) => {
  mem.sets[key] = mem.sets[key] || new Set();
  mem.sets[key].add(member);
};
const memCount = (key) => (mem.sets[key] ? mem.sets[key].size : 0);
const memHash = (key) => ({ ...(mem.hashes[key] || {}) });

// ─── Recording ─────────────────────────────────────────────
/**
 * Record a single view.
 * @param {object} v
 * @param {'article'|'page'|'writer'} v.type
 * @param {string} [v.id]        canonical post id (articles)
 * @param {string} [v.path]      pathname
 * @param {string} [v.visitor]   anonymous visitor id
 * @param {string} [v.referrer]  referrer host
 * @param {string} [v.country]   ISO country code
 * @param {string} [v.device]    Mobile / Desktop / Tablet
 */
export async function recordView({ type, id, path, visitor, referrer, country, device }) {
  const today = dayKey();
  const vid = cleanField(visitor, 64) || 'anon';
  const pid = cleanField(id, 160);
  const pth = cleanField(path, 160) || '/';
  const ref = cleanField(referrer, 80);
  const ctry = cleanField(country, 8).toUpperCase();
  const dev = cleanField(device, 16);

  const r = await getRedis().catch(() => null);

  if (!r) {
    memIncr(`${P}totals`, type);
    memIncr(`${P}day:${today}`, type);
    memAdd(`${P}uniq:all`, vid);
    memAdd(`${P}uniq:day:${today}`, vid);
    if (type === 'article' && pid) {
      memIncr(`${P}post_views`, pid);
      memIncr(`${P}post_day:${today}`, pid);
      memAdd(`${P}post_uniq:${pid}`, vid);
      memAdd(`${P}uniq:readers`, vid);
    } else if (type === 'writer') {
      memAdd(`${P}uniq:writer`, vid);
    } else {
      memIncr(`${P}pages`, pth);
    }
    if (type !== 'writer') {
      if (ref) memIncr(`${P}ref`, ref);
      if (ctry) memIncr(`${P}country`, ctry);
      if (dev) memIncr(`${P}device`, dev);
    }
    return getPostViews(pid);
  }

  try {
    const ops = [
      r.hIncrBy(`${P}totals`, type, 1),
      r.hIncrBy(`${P}day:${today}`, type, 1),
      r.expire(`${P}day:${today}`, DAY_TTL),
      r.pfAdd(`${P}uniq:all`, vid),
      r.pfAdd(`${P}uniq:day:${today}`, vid),
      r.expire(`${P}uniq:day:${today}`, DAY_TTL),
    ];
    if (type === 'article' && pid) {
      ops.push(
        r.hIncrBy(`${P}post_views`, pid, 1),
        r.hIncrBy(`${P}post_day:${today}`, pid, 1),
        r.expire(`${P}post_day:${today}`, DAY_TTL),
        r.pfAdd(`${P}post_uniq:${pid}`, vid),
        r.pfAdd(`${P}uniq:readers`, vid),
      );
    } else if (type === 'writer') {
      ops.push(r.pfAdd(`${P}uniq:writer`, vid));
    } else {
      ops.push(r.hIncrBy(`${P}pages`, pth, 1));
    }
    if (type !== 'writer') {
      if (ref) ops.push(r.hIncrBy(`${P}ref`, ref, 1));
      if (ctry) ops.push(r.hIncrBy(`${P}country`, ctry, 1));
      if (dev) ops.push(r.hIncrBy(`${P}device`, dev, 1));
    }
    await Promise.all(ops);
  } catch (e) {
    console.error('Analytics record error:', e);
  }
  return getPostViews(pid);
}

// ─── Reading ───────────────────────────────────────────────
export async function getPostViews(id) {
  const pid = cleanField(id, 160);
  if (!pid) return { views: 0, unique: 0 };
  const r = await getRedis().catch(() => null);
  if (!r) {
    return {
      views: Number(memHash(`${P}post_views`)[pid] || 0),
      unique: memCount(`${P}post_uniq:${pid}`),
    };
  }
  try {
    const [views, unique] = await Promise.all([
      r.hGet(`${P}post_views`, pid),
      r.pfCount(`${P}post_uniq:${pid}`),
    ]);
    return { views: Number(views || 0), unique: Number(unique || 0) };
  } catch (e) {
    console.error('Analytics read error:', e);
    return { views: 0, unique: 0 };
  }
}

export async function getAllPostViews() {
  const r = await getRedis().catch(() => null);
  const raw = r ? await r.hGetAll(`${P}post_views`).catch(() => ({})) : memHash(`${P}post_views`);
  const out = {};
  for (const [k, v] of Object.entries(raw || {})) out[k] = Number(v || 0);
  return out;
}

const toNumMap = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) out[k] = Number(v || 0);
  return out;
};
const topN = (obj, n = 10) =>
  Object.entries(obj || {})
    .map(([key, count]) => ({ key, count: Number(count || 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);

/** Full dashboard statistics (writer-only). */
export async function getDashboardStats(days = 14) {
  const r = await getRedis().catch(() => null);
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(dayKey(d));
  }
  const last7 = dates.slice(-7);

  const read = async (fnRedis, fnMem) => {
    try { return r ? await fnRedis() : fnMem(); } catch (e) { console.error('Analytics stats error:', e); return fnMem(); }
  };

  const totals = toNumMap(await read(() => r.hGetAll(`${P}totals`), () => memHash(`${P}totals`)));
  const postViews = toNumMap(await read(() => r.hGetAll(`${P}post_views`), () => memHash(`${P}post_views`)));
  const pages = toNumMap(await read(() => r.hGetAll(`${P}pages`), () => memHash(`${P}pages`)));
  const referrers = toNumMap(await read(() => r.hGetAll(`${P}ref`), () => memHash(`${P}ref`)));
  const countries = toNumMap(await read(() => r.hGetAll(`${P}country`), () => memHash(`${P}country`)));
  const devices = toNumMap(await read(() => r.hGetAll(`${P}device`), () => memHash(`${P}device`)));

  const uniqueVisitors = Number(await read(() => r.pfCount(`${P}uniq:all`), () => memCount(`${P}uniq:all`)) || 0);
  const uniqueReaders = Number(await read(() => r.pfCount(`${P}uniq:readers`), () => memCount(`${P}uniq:readers`)) || 0);
  const uniqueWriters = Number(await read(() => r.pfCount(`${P}uniq:writer`), () => memCount(`${P}uniq:writer`)) || 0);

  const daily = await Promise.all(dates.map(async (date) => {
    const h = toNumMap(await read(() => r.hGetAll(`${P}day:${date}`), () => memHash(`${P}day:${date}`)));
    const uniq = Number(await read(() => r.pfCount(`${P}uniq:day:${date}`), () => memCount(`${P}uniq:day:${date}`)) || 0);
    return { date, article: h.article || 0, page: h.page || 0, writer: h.writer || 0, unique: uniq };
  }));

  // Article views over the last 7 days (trending)
  const weekly = {};
  for (const date of last7) {
    const h = toNumMap(await read(() => r.hGetAll(`${P}post_day:${date}`), () => memHash(`${P}post_day:${date}`)));
    for (const [k, v] of Object.entries(h)) weekly[k] = (weekly[k] || 0) + v;
  }

  // Unique readers per article (only for articles with views)
  const postIds = Object.keys(postViews);
  const postUnique = {};
  await Promise.all(postIds.map(async (pid) => {
    postUnique[pid] = Number(await read(() => r.pfCount(`${P}post_uniq:${pid}`), () => memCount(`${P}post_uniq:${pid}`)) || 0);
  }));

  return {
    storage: r ? 'redis' : 'memory',
    generatedAt: new Date().toISOString(),
    totals: {
      articleViews: totals.article || 0,
      pageViews: totals.page || 0,
      writerVisits: totals.writer || 0,
      allViews: (totals.article || 0) + (totals.page || 0),
      uniqueVisitors,
      uniqueReaders,
      uniqueWriters,
    },
    daily,
    posts: postIds.map((id) => ({ id, views: postViews[id], unique: postUnique[id] || 0, week: weekly[id] || 0 })),
    topPages: topN(pages, 10),
    referrers: topN(referrers, 10),
    countries: topN(countries, 12),
    devices: topN(devices, 3),
  };
}
