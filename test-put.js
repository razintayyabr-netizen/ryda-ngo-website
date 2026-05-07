const https = require('https');

const req = https.request({
  hostname: 'rydarohingya.org',
  path: '/api/posts',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Writer-Token': '12345678'
  }
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(JSON.stringify({
  id: 'post-1776448730149-jrhn',
  featured_image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80'
}));
req.end();
