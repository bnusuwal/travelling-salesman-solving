const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, 'public', filePath);
  
  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css'
  }[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if(err) {
      res.writeHead(404);
      res.end('404 - File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n=================================');
  console.log('Traveling Salesman Problem Solver');
  console.log('=================================');
  console.log('Server running at: http://localhost:' + PORT);
  console.log('Press Ctrl+C to stop\n');
});