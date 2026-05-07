const https = require('https');
const data = JSON.stringify({token: '12345678'});
const req = https.request({
  hostname: 'ryda-ngo-website.vercel.app',
  path: '/api/auth',
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}
}, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
    // Check env from process
    console.log('WRITER_TOKEN:', process.env.WRITER_TOKEN);
  });
});
req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();