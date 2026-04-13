export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/writer', '/api/'],
      },
    ],
    sitemap: 'https://ryda-rohingya.org/sitemap.xml',
  };
}