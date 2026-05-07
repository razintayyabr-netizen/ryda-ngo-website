const https = require('https');

const toDelete = [
  'post-1776458838300-gra3',
  'post-1776459273328-1zf9',
  'post-1776459273310-4kn5',
  'post-1776459273282-7gpa',
  'post-1776459273261-m02r',
  'post-1776459273241-uxzv'
];

let done = 0;
toDelete.forEach(id => {
  const req = https.request({
    hostname: 'rydarohingya.org',
    path: `/api/posts?id=${encodeURIComponent(id)}`,
    method: 'DELETE',
    headers: { 'X-Writer-Token': '12345678' }
  }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      done++;
      console.log(`[${done}/${toDelete.length}] ${id} → ${res.statusCode}`);
      if (done === toDelete.length) console.log('\nDone!');
    });
  });
  req.on('error', e => { done++; console.error('Error:', e.message); });
  req.end();
});
