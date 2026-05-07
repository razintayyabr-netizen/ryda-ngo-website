const https = require('https');

function apiRequest(method, path, body = null, token = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Check env vars via API
  const projRes = await apiRequest('GET', '/v6/projects/tayyabs-projects-83e87bb3/ryda-ngo-website', null, process.env.VERCEL_OIDC_TOKEN);
  console.log('Project:', projRes.status, projRes.body);
  
  // Try auth with hardcoded check
  const https2 = require('https');
  const data = JSON.stringify({token: '12345678'});
  const req = https2.request({
    hostname: 'ryda-ngo-website.vercel.app',
    path: '/api/auth',
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log('Auth status:', res.statusCode);
      console.log('Auth response:', body);
    });
  });
  req.on('error', e => console.error(e));
  req.write(data);
  req.end();
}

main().catch(console.error);