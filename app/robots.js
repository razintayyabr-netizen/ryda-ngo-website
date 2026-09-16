export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/writer', '/api/'],
      },
    ],
    sitemap: 'https://rydarohingya.org/sitemap.xml',
  };
}