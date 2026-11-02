import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  const inline = args.find(arg => arg.startsWith(name + '='));
  if (inline) return inline.slice(name.length + 1);
  if (index !== -1) {
    if (!args[index + 1] || args[index + 1].startsWith('--')) {
      console.error(`Missing value for ${name}`); process.exit(1);
    }
    return args[index + 1];
  }
  return fallback;
}
const host = option('--host', '0.0.0.0');
const port = Number(option('--port', process.env.PORT || '5173'));
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Port must be an integer between 1 and 65535.'); process.exit(1);
}
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep) || !['/index.html', '/src/main.js', '/src/style.css'].includes(pathname === '/' ? '/index.html' : pathname)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-cache' }); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error', error => {
  console.error(`Cannot start Pixel Aquarium on ${host}:${port}: ${error.code}`);
  if (error.code === 'EADDRINUSE') console.error('Port is already in use. Stop the previous server or choose --port <number>.');
  process.exit(1);
});
server.listen(port, host, () => {
  console.log(`Pixel Aquarium listening on ${host}:${port}`);
  console.log('Cloud: use a platform-provided Preview/port-forward URL if available. This address is not a public URL.');
});
