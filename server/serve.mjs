// Optional standalone server for the built interface + the same local API.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createLocalAuthHandler } from './localAuth.mjs';

const root = resolve('dist');
const auth = createLocalAuthHandler();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  if (req.url?.startsWith('/api/')) return auth(req, res);
  const pathname = decodeURI(new URL(req.url, 'http://localhost').pathname);
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
