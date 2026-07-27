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

async function getPost(slugOrId) {
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

  return STATIC_NEWS.find(p => p.id === slugOrId || p.slug === slugOrId) || null;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  
  let reqHost = 'rydarohingya.org';
  try {
    const headersList = headers();
    reqHost = headersList.get('host') || headersList.get('x-forwarded-host') || 'rydarohingya.org';
  } catch (e) {}

  const protocol = reqHost.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${reqHost}`;

  if (!post) {
    return {
      title: 'Article Not Found — RYDA',
      description: 'The requested article could not be found in the RYDA newsroom.',
    };
  }

  let rawImages = Array.isArray(post.images) && post.images.length > 0
    ? post.images
    : (post.featured_image ? [post.featured_image] : []);

  if (!rawImages.length) {
    rawImages = ['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80'];
  }

  const absoluteImages = rawImages.map(img => {
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  });

  const canonicalUrl = `${baseUrl}/newsroom/${post.slug || post.id}`;
  const textLength = ((post.content || '') + (post.summary || '')).replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(textLength / 200));
  const primaryImage = absoluteImages[0];

  return {
    title: `${post.title} — RYDA Newsroom`,
    description: post.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: canonicalUrl,
      siteName: 'RYDA — Rohingya Youth Development Association',
      locale: 'en_US',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author || 'RYDA Team'],
      tags: post.tags || [],
      images: absoluteImages.map(url => ({
        url,
        secureUrl: url,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: post.title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      site: '@RYDA35',
      creator: '@RYDA35',
      images: [primaryImage, ...absoluteImages.slice(1)],
    },
    other: {
      'twitter:image:src': primaryImage,
      'twitter:image:alt': post.title,
      'twitter:label1': 'Written by',
      'twitter:data1': post.author || 'RYDA Team',
      'twitter:label2': 'Reading time',
      'twitter:data2': `${readTimeMin} min read`,
    },
  };
}

export async function generateStaticParams() {
  return STATIC_NEWS.map(post => ({ slug: post.id }));
}

export default async function ArticlePage({ params }) {
  const post = await getPost(params.slug);
  return <ArticleClient post={post} slug={params.slug} />;
}
