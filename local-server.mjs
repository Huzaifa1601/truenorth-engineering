import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml'
  ,'.png': 'image/png'
  ,'.ico': 'image/x-icon'
  ,'.webp': 'image/webp'
};

createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const cleanPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const pathname = cleanPath === '\\' || cleanPath === '/' ? 'index.html' : cleanPath.replace(/^[/\\]/, '');
  let file = join(root, pathname);

  try {
    if(statSync(file).isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(root, '404.html');
    response.statusCode = 404;
  }

  response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`True North preview running at http://localhost:${port}`);
});
