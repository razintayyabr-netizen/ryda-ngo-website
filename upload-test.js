const https = require('https');

// Minimal valid 1x1 green PNG
const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108020000001f15c4890000000c49444154789cedc1010000000002a0001feca060000000049454e44ae426082', 'hex');

console.log('PNG size:', png.length, 'bytes');

// Test Imgur directly
const req = https.request({
  hostname: 'api.imgur.com',
  path: '/3/image',
  method: 'POST',
  headers: {
    'Authorization': 'Client-ID c7a9092b4a4c0aa',
    'Content-Type': 'application/octet-stream',
    'Content-Length': png.length
  }
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Imgur Status:', res.statusCode);
    console.log('Imgur Body:', data.substring(0, 500));
  });
});

req.on('error', e => console.error('Imgur Error:', e.message));
req.write(png);
req.end();
