const https = require('https');

const updates = [
  {
    id: 'post-1776448730149-jrhn',
    featured_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80'
  },
  {
    id: 'post-1775831737706-4we5',
    featured_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'
  },
  {
    id: 'post-1775687166975-wb6j',
    featured_image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80'
  }
];

let done = 0;
updates.forEach(({ id, featured_image }) => {
  const body = JSON.stringify({ id, featured_image });
  const req = https.request({
    hostname: 'rydarohingya.org',
    path: '/api/posts',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Writer-Token': '12345678',
      'Content-Length': Buffer.byteLength(body)
    }
  }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      done++;
      console.log(`[${done}/${updates.length}] ${id} → ${res.statusCode}`);
      if (done === updates.length) console.log('\nDone!');
    });
  });
  req.on('error', e => { done++; console.error('Error:', e.message); });
  req.write(body);
  req.end();
});
