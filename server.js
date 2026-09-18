/* Art Angel dev/preview server — zero dependencies.
 *
 * - Binds 0.0.0.0 and honors the PORT injected by Freebuff.
 * - Serves the project root by default so edits show up instantly.
 * - Set SERVE_DIST=1 to serve the production build in dist/ instead.
 * - Sends no-store cache headers so preview testing always sees fresh files.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT =
  process.env.SERVE_DIST === '1' && fs.existsSync(path.join(__dirname, 'dist'))
    ? path.join(__dirname, 'dist')
    : __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let filePath = path.normalize(path.join(ROOT, urlPath));

    // Prevent path traversal outside the served root.
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    let stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    }
    if (!stat) filePath = path.join(ROOT, 'index.html'); // single-page fallback

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Art Angel serving ${ROOT} at http://${HOST}:${PORT}`);
});
