import STATIC_NEWS from '@/lib/staticNews';
import ArticleClient from './ArticleClient';
import { headers } from 'next/headers';
import { getPostByIdOrSlug } from '@/lib/postsStore';

export const revalidate = 60; // Revalidate every minute

async function getPost(slugOrId, reqBaseUrl = 'https://rydarohingya.org') {
  // 1. Try postsStore directly (Redis + shared memory fallback)
  try {
    const post = await getPostByIdOrSlug(slugOrId);
    if (post) return post;
  } catch (e) {}

  // 2. Try internal /api/posts fetch
  try {
    const fetchUrl = `${reqBaseUrl}/api/posts?id=${encodeURIComponent(slugOrId)}`;
    const res = await fetch(fetchUrl, { next: { revalidate: 10 } });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.id || data.slug)) return data;
    }
  } catch (e) {}

  return null;
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
    if (url.includes('/api/image/')) {
      url = url.replace(/\/+$/, '');
      if (!url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        url = `${url}.jpg`;
      }
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
  const params = [];
  for (const post of STATIC_NEWS) {
    if (post.id) params.push({ slug: post.id });
    if (post.slug) params.push({ slug: post.slug });
  }
  return params;
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

  return <ArticleClient post={post} slug={params.slug} />;
}
