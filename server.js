
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = process.cwd();

const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/vnd.microsoft.icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method Not Allowed');
      return;
    }

    const pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname
    );

    const route = pathname === '/' ? '/index.html' : pathname;
    const file = resolve(root, `.${route}`);

    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const data = await readFile(file);
    const contentType =
      types[extname(file).toLowerCase()] ??
      'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    const status = error?.code === 'ENOENT' || error?.code === 'ENOTDIR'
      ? 404
      : 500;

    res.writeHead(status, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    });

    res.end(status === 404 ? 'Not Found' : 'Internal Server Error');

    if (status === 500) {
      console.error('Request failed:', error);
    }
  }
});

const port = Number(process.env.PORT) || 4173;

server.listen(port, '0.0.0.0', () => {
  console.log(`Harshit OS running on port ${port}`);
});

server.on('error', (error) => {
  console.error('Harshit OS server error:', error);
  process.exitCode = 1;
});
