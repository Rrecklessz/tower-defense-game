const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml',
};

http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url==='/'?'index.html':req.url);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: '+req.url); return; }
    res.writeHead(200, {'Content-Type': MIME[ext]||'text/plain'});
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('\n🎮 Warcraft TD running!');
  console.log('👉 Open: http://localhost:'+PORT+'\n');
});
