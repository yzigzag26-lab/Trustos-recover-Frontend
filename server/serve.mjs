// Optional standalone server for the built, frontend-only interface.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  const pathname = decodeURI(new URL(req.url, 'http://localhost').pathname);
  // Static hosting never accepts API requests or mutates accounts.
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  const filepath = resolve(root, '.' + pathname);
  try {
    if (!filepath.startsWith(root + '/') && filepath !== root) throw new Error('Invalid path');
    const info = await stat(filepath);
    if (!info.isFile()) throw new Error('Not a file');
    const buffer = await readFile(filepath);
    res.writeHead(200, { 'Content-Type': types[extname(filepath)] || 'application/octet-stream' });
    res.end(buffer);
  } catch {
    try {
      const html = await readFile(resolve(root, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch {
      res.writeHead(500); res.end('Build the interface first: npm run build');
    }
  }
}).listen(port, '0.0.0.0', () => console.log(`Trustos preview listening on 0.0.0.0:${port}`));
