import { NextResponse } from 'next/server';
import { isValidWriterToken } from '@/lib/auth';
import { getPostByIdOrSlug } from '@/lib/postsStore';
import {
  recordView,
  getPostViews,
  getAllPostViews,
  getDashboardStats,
  isBot,
  detectDevice,
} from '@/lib/viewsStore';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function refHost(referrer, ownHost) {
  try {
    if (!referrer) return 'Direct';
    const h = new URL(referrer).hostname.replace(/^www\./, '');
    if (!h || (ownHost && h === ownHost.replace(/^www\./, '').split(':')[0])) return '';
    if (/(^|\.)t\.co$|twitter\.com|x\.com/.test(h)) return 'X / Twitter';
    if (/facebook\.com|fb\.com|fb\.me|m\.facebook/.test(h)) return 'Facebook';
    if (/google\./.test(h)) return 'Google';
    if (/linkedin\.com|lnkd\.in/.test(h)) return 'LinkedIn';
    if (/whatsapp/.test(h)) return 'WhatsApp';
    if (/t\.me|telegram/.test(h)) return 'Telegram';
    if (/instagram\.com/.test(h)) return 'Instagram';
    if (/bing\.com/.test(h)) return 'Bing';
    return h;
  } catch {
    return '';
  }
}

// POST /api/views  { path, id?, visitor, referrer }
export async function POST(request) {
  try {
    const ua = request.headers.get('user-agent') || '';
    let body = {};
    try { body = await request.json(); } catch {}

    const path = String(body.path || '/').split('?')[0].slice(0, 160);
    let type = 'page';
    let id = '';

    if (path.startsWith('/writer')) {
      type = 'writer';
    } else {
      const m = path.match(/^\/newsroom\/([^/]+)\/?$/);
      const candidate = body.id || (m && m[1] !== 'article' ? decodeURIComponent(m[1]) : '');
      if (candidate) {
        type = 'article';
        const post = await getPostByIdOrSlug(candidate).catch(() => null);
        id = post ? (post.id || post.slug || candidate) : candidate;
      }
    }

    if (isBot(ua)) {
      const counts = id ? await getPostViews(id) : { views: 0, unique: 0 };
      return NextResponse.json({ ok: true, counted: false, type, id, ...counts }, { headers: NO_STORE });
    }

    const ownHost = request.headers.get('host') || '';
    const counts = await recordView({
      type,
      id,
      path,
      visitor: body.visitor,
      referrer: refHost(body.referrer, ownHost),
      country: request.headers.get('x-vercel-ip-country') || '',
      device: detectDevice(ua),
    });

    return NextResponse.json({ ok: true, counted: true, type, id, ...counts }, { headers: NO_STORE });
  } catch (err) {
    console.error('POST /api/views error:', err);
    return NextResponse.json({ ok: false }, { status: 200, headers: NO_STORE });
  }
}

// GET /api/views?id=...           → { views, unique } for one article (public)
// GET /api/views?all=1            → { [postId]: views } map (public)
// GET /api/views?stats=1 (+token) → full audience dashboard (writer only)
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    if (searchParams.get('stats')) {
      const token = request.headers.get('x-writer-token') || '';
      if (!isValidWriterToken(token)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });
      }
      const days = Math.min(90, Math.max(7, Number(searchParams.get('days')) || 14));
      const stats = await getDashboardStats(days);
      return NextResponse.json(stats, { headers: NO_STORE });
    }

    const id = searchParams.get('id');
    if (id) {
      const post = await getPostByIdOrSlug(id).catch(() => null);
      const canonicalId = post ? (post.id || post.slug || id) : id;
      const counts = await getPostViews(canonicalId);
      if (counts.views === 0 && canonicalId !== id) {
        const alt = await getPostViews(id);
        if (alt.views > 0) return NextResponse.json(alt, { headers: NO_STORE });
      }
      return NextResponse.json(counts, { headers: NO_STORE });
    }

    const all = await getAllPostViews();
    return NextResponse.json(all, { headers: NO_STORE });
  } catch (err) {
    console.error('GET /api/views error:', err);
    return NextResponse.json({}, { headers: NO_STORE });
  }
}
