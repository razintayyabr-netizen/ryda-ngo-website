import STATIC_NEWS from '@/lib/staticNews';
import ArticleClient from './ArticleClient';
import { createClient } from 'redis';
import { headers } from 'next/headers';

export const revalidate = 60; // Revalidate every minute

let redis = null;
let redisPromise = null;

async function getRedis() {
  if (redis && redis.isOpen) return redis;
  if (!process.env.REDIS_URL) return null;
  if (!redisPromise) {
    redisPromise = (async () => {
      try {
        redis = createClient({ url: process.env.REDIS_URL });
        redis.on('error', () => {});
        await redis.connect();
        return redis;
      } catch (e) {
        redisPromise = null;
        return null;
      }
    })();
  }
  return redisPromise;
}

async function getPost(slugOrId, reqBaseUrl = 'https://rydarohingya.org') {
  // 1. Try Redis
  try {
    const r = await getRedis();
    if (r) {
      const raw = await r.get('ryda:posts');
      if (raw) {
        const posts = JSON.parse(raw);
        const found = posts.find(p => p.id === slugOrId || p.slug === slugOrId);
        if (found) return found;
      }
    }
  } catch (e) {}

  // 2. Try internal /api/posts fetch for dynamic posts
  try {
    const fetchUrl = `${reqBaseUrl}/api/posts?id=${encodeURIComponent(slugOrId)}`;
    const res = await fetch(fetchUrl, { next: { revalidate: 10 } });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.slug)) return data;
    }
  } catch (e) {}

  // 3. Fallback to STATIC_NEWS
  return STATIC_NEWS.find(p => p.id === slugOrId || p.slug === slugOrId) || null;
}

export async function generateMetadata({ params }) {
  let reqHost = 'rydarohingya.org';
  try {
    const headersList = headers();
    reqHost = headersList.get('host') || headersList.get('x-forwarded-host') || 'rydarohingya.org';
  } catch (e) {}

  const protocol = reqHost.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${reqHost}`;

  const post = await getPost(params.slug, baseUrl);

  const title = post ? `${post.title} — RYDA Newsroom` : 'Article — RYDA Newsroom';
  const description = post ? post.summary : 'Read the latest statements, updates, and reports from the Rohingya Youth Development Association (RYDA).';

  let rawImages = [];
  if (post) {
    if (Array.isArray(post.images) && post.images.length > 0) {
      rawImages = post.images.map(img => typeof img === 'string' ? img : (img?.url || '')).filter(Boolean);
    }
    if (!rawImages.length && post.featured_image) {
      const feat = typeof post.featured_image === 'string' ? post.featured_image : (post.featured_image?.url || '');
      if (feat) rawImages = [feat];
    }
  }

  if (!rawImages.length) {
    rawImages = ['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80'];
  }

  const absoluteImages = rawImages.map(img => {
    let url = typeof img === 'string' ? img : (img?.url || '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    if (url.includes('/api/image/') && !url.endsWith('/')) {
      url = `${url}/`;
    }
    return url;
  });

  const canonicalUrl = `${baseUrl}/newsroom/${post ? (post.slug || post.id) : params.slug}`;
  const textLength = post ? ((post.content || '') + (post.summary || '')).replace(/<[^>]*>/g, '').split(/\s+/).length : 200;
  const readTimeMin = Math.max(1, Math.ceil(textLength / 200));
  const primaryImage = absoluteImages[0];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'RYDA — Rohingya Youth Development Association',
      locale: 'en_US',
      type: 'article',
      publishedTime: post ? post.date : new Date().toISOString(),
      authors: [post ? (post.author || 'RYDA Team') : 'RYDA Team'],
      tags: post?.tags || [],
      images: absoluteImages.map(url => ({
        url,
        secureUrl: url,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@RYDA35',
      creator: '@RYDA35',
      images: [primaryImage, ...absoluteImages.slice(1)],
    },
    other: {
      'twitter:image': primaryImage,
      'twitter:image:src': primaryImage,
      'twitter:image:alt': title,
      'twitter:label1': 'Written by',
      'twitter:data1': post ? (post.author || 'RYDA Team') : 'RYDA Team',
      'twitter:label2': 'Reading time',
      'twitter:data2': `${readTimeMin} min read`,
    },
  };
}

export async function generateStaticParams() {
  return STATIC_NEWS.map(post => ({ slug: post.id }));
}

export default async function ArticlePage({ params }) {
  let reqHost = 'rydarohingya.org';
  try {
    const headersList = headers();
    reqHost = headersList.get('host') || headersList.get('x-forwarded-host') || 'rydarohingya.org';
  } catch (e) {}

  const protocol = reqHost.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${reqHost}`;

  const post = await getPost(params.slug, baseUrl);

  let rawImages = [];
  if (post) {
    if (Array.isArray(post.images) && post.images.length > 0) {
      rawImages = post.images.map(img => typeof img === 'string' ? img : (img?.url || '')).filter(Boolean);
    }
    if (!rawImages.length && post.featured_image) {
      const feat = typeof post.featured_image === 'string' ? post.featured_image : (post.featured_image?.url || '');
      if (feat) rawImages = [feat];
    }
  }

  if (!rawImages.length) {
    rawImages = ['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80'];
  }

  const absoluteImages = rawImages.map(img => {
    let url = typeof img === 'string' ? img : (img?.url || '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    if (url.includes('/api/image/') && !url.endsWith('/')) {
      url = `${url}/`;
    }
    return url;
  });

  const finalImg = absoluteImages[0];
  const postTitle = post ? `${post.title} — RYDA Newsroom` : 'Article — RYDA Newsroom';
  const postSummary = post ? post.summary : 'Read updates and reports from RYDA.';

  return (
    <>
      <head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@RYDA35" />
        <meta name="twitter:creator" content="@RYDA35" />
        <meta name="twitter:title" content={postTitle} />
        <meta name="twitter:description" content={postSummary} />
        <meta name="twitter:image" content={finalImg} />
        <meta name="twitter:image:src" content={finalImg} />
        <meta property="og:title" content={postTitle} />
        <meta property="og:description" content={postSummary} />
        <meta property="og:image" content={finalImg} />
        <meta property="og:image:secure_url" content={finalImg} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:type" content="article" />
      </head>
      <ArticleClient post={post} slug={params.slug} />
    </>
  );
}
