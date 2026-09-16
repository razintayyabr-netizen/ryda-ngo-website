import { getAllActivePosts } from '@/lib/postsStore';

export default async function sitemap() {
  const baseUrl = 'https://rydarohingya.org';

  const staticEntries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/newsroom`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sitemap`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/writer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  let postEntries = [];
  try {
    const posts = await getAllActivePosts();
    postEntries = posts.map(post => ({
      url: `${baseUrl}/newsroom/${post.slug || post.id}`,
      lastModified: post.updatedAt || post.date || post.createdAt ? new Date(post.updatedAt || post.date || post.createdAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Error loading posts for sitemap:', e);
  }

  return [...staticEntries, ...postEntries];
}