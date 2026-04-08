const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 3000;
const host = '127.0.0.1';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

http
  .createServer((req, res) => {
    const requestPath = decodeURIComponent(req.url.split('?')[0]);
    const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const targetPath = stats.isDirectory() ? path.join(filePath, 'index.html') : filePath;
      fs.readFile(targetPath, (readError, data) => {
        if (readError) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        const extension = path.extname(targetPath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': mimeTypes[extension] || 'application/octet-stream',
        });
        res.end(data);
      });
    });
  })
  .listen(port, host, () => {
    console.log(`Conexte local server running at http://${host}:${port}`);
  });
