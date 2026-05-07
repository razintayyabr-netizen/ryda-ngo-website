const https = require('https');

const postData = {
  title: "Article Name Here",
  summary: "This is a sample article placeholder — replace this with your actual news content from the Writer Panel.",
  content: "<p>This is a sample article added to demonstrate how articles appear in the RYDA Newsroom.</p><p>From the Writer Panel, you can publish real statements, reports, and field updates with images, categories, and full formatting.</p>",
  category: "Statement",
  author: "RYDA Team",
  featured_image: "",
  tags: ["sample", "placeholder"]
};

const body = JSON.stringify(postData);

const req = https.request({
  hostname: 'rydarohingya.org',
  path: '/api/posts',
  method: 'POST',
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
req.write(body);
req.end();
