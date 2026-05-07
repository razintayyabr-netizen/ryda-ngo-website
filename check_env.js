const https = require('https');

const projectId = 'prj_0aGxb51tqufRTflVbTwUbLuCa2c6';
const token = process.env.VERCEL_OIDC_TOKEN;

async function api(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ s: res.statusCode, b: JSON.parse(d) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // Get env vars
  const r = await api('GET', `/v1/projects/${projectId}/env?decrypt=true`);
  console.log('Env vars:', JSON.stringify(r.b, null, 2));
}

main().catch(console.error);