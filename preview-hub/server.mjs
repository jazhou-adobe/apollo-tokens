#!/usr/bin/env node
// Apollo preview hub: one port, every brand's design-system preview mapped by path.
//
//   npm run preview            # http://localhost:3000
//   HUB_PORT=4000 npm run preview
//
// Each brand in brands.json is a Next.js preview app whose basePath is `/<slug>`, so `/<slug>/*` is proxied to that
// app's own dev server unchanged (pages, /_next assets, and the HMR websocket). A brand server that is already
// listening is reused; otherwise the hub starts `next dev` in the brand's directory and restarts it if it exits.
//
// The hub also serves each brand's standalone world previews as static files at `/_previews/<slug>/<path>`, from
// `research/world-previews/` (candidates and chosen worlds) and `archive/worlds/` (options not taken), and lists them
// on the index page. The list is read on every index request, so a new preview appears without a restart.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const hubDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(hubDir, '..');
const HUB_PORT = Number(process.env.HUB_PORT ?? 3000);
const RESTART_LIMIT = 5; // restarts per brand per minute before giving up
const PREVIEW_ROOTS = ['research/world-previews', 'archive/worlds'];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

/** tokenPrefix and defaultTheme are read by .skills/apply-apollo-theme, not by the hub. */
/** @type {{ slug: string; label: string; summary: string; dir: string; port: number; tokenPrefix: string; defaultTheme: string }[]} */
const brands = JSON.parse(readFileSync(resolve(hubDir, 'brands.json'), 'utf8'));
const children = new Set();

const brandFor = (url = '/') => brands.find((brand) => url === `/${brand.slug}` || url.startsWith(`/${brand.slug}/`) || url.startsWith(`/${brand.slug}?`));

const escapeHtml = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Every `<slug>.html` world preview of a brand: built (has tokens/worlds/<slug>.json), preview only, or archived. */
function listPreviews(brand) {
  const root = resolve(repoRoot, brand.dir);
  const found = [];
  for (const previewRoot of PREVIEW_ROOTS) {
    const base = join(root, previewRoot);
    if (!existsSync(base)) continue;
    const archived = previewRoot.startsWith('archive/');
    const dirs = archived ? readdirSync(base).map((d) => join(base, d)).filter((d) => statSync(d).isDirectory()) : [base];
    for (const dir of dirs) {
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
        const slug = basename(file, '.html');
        const html = readFileSync(join(dir, file), 'utf8');
        const title = html.match(/<title>([^<]*)<\/title>/i)?.[1].trim() || slug;
        const thumb = existsSync(join(dir, `${slug}.png`)) ? `${slug}.png` : null;
        const status = archived ? 'Archived' : existsSync(join(root, 'tokens/worlds', `${slug}.json`)) ? 'Built' : 'Preview only';
        const href = (name) => `/_previews/${brand.slug}/${relative(root, join(dir, name)).split(sep).join('/')}`;
        found.push({ slug, title, status, href: href(file), thumb: thumb && href(thumb) });
      }
    }
  }
  const order = { Built: 0, 'Preview only': 1, Archived: 2 };
  return found.sort((a, b) => order[a.status] - order[b.status] || a.slug.localeCompare(b.slug));
}

/** Static file under one of the brand's PREVIEW_ROOTS, or null. Rejects any path that leaves those roots. */
function previewFile(url) {
  const match = url.split('?')[0].match(/^\/_previews\/([^/]+)\/(.+)$/);
  const brand = match && brands.find((b) => b.slug === match[1]);
  if (!brand) return null;
  const root = resolve(repoRoot, brand.dir);
  const file = resolve(root, decodeURIComponent(match[2]));
  const allowed = PREVIEW_ROOTS.some((p) => file.startsWith(join(root, p) + sep));
  return allowed && MIME[extname(file)] && existsSync(file) && statSync(file).isFile() ? file : null;
}

function isListening(port) {
  return new Promise((done) => {
    const socket = net.connect(port, '127.0.0.1');
    socket.once('connect', () => (socket.destroy(), done(true)));
    socket.once('error', () => done(false));
  });
}

function startBrand(brand) {
  const cwd = resolve(repoRoot, brand.dir);
  const restarts = [];
  const run = () => {
    const child = spawn('npx', ['next', 'dev', '--port', String(brand.port)], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    children.add(child);
    const prefix = `[${brand.slug}] `;
    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', (chunk) => process.stdout.write(String(chunk).replace(/^(?=.)/gm, prefix)));
    }
    child.on('exit', (code, signal) => {
      children.delete(child);
      if (shuttingDown) return;
      const now = Date.now();
      restarts.push(now);
      while (restarts.length && now - restarts[0] > 60_000) restarts.shift();
      if (restarts.length > RESTART_LIMIT) {
        console.error(`${prefix}next dev exited (${signal ?? code}) ${RESTART_LIMIT} times in a minute; not restarting.`);
        return;
      }
      // `next dev` can stop once after start-up to print an upgrade notice; a plain restart continues.
      console.log(`${prefix}next dev exited (${signal ?? code}); restarting.`);
      setTimeout(run, 1000);
    });
  };
  run();
}

function indexPage() {
  const rows = brands
    .map((brand) => {
      const previews = listPreviews(brand)
        .map(
          (p) => `<li><a href="${p.href}">${p.thumb ? `<img src="${p.thumb}" alt="" loading="lazy">` : ''}<span>${escapeHtml(p.title)}</span></a><small>${p.status}</small></li>`,
        )
        .join('');
      return `<section>
  <h2><a href="/${brand.slug}/overview">${brand.label}</a></h2>
  <p>${brand.summary}</p>
  <p class="links"><a href="/${brand.slug}/overview">Every theme</a><a href="/${brand.slug}/worlds">Worlds</a><a href="/${brand.slug}/design">Design system</a><a href="/${brand.slug}/specimen">Specimen</a></p>
  ${previews ? `<h3>World previews</h3><ul class="previews">${previews}</ul>` : ''}
</section>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Apollo design-system previews</title>
<style>
  :root { color-scheme: light dark; font-family: system-ui, sans-serif; line-height: 1.5; }
  body { margin: 0 auto; max-width: 64rem; padding: 3rem 1.25rem; }
  h1 { font-size: 1.75rem; margin: 0 0 2rem; }
  section { border-top: 1px solid color-mix(in srgb, currentColor 25%, transparent); padding: 1.25rem 0; }
  h2 { font-size: 1.25rem; margin: 0; }
  h3 { font-size: 1rem; margin: 1.25rem 0 0.5rem; }
  .previews { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 1rem; list-style: none; margin: 0; padding: 0; }
  .previews a { display: grid; gap: 0.35rem; text-decoration: none; }
  .previews img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; object-position: top; border: 1px solid color-mix(in srgb, currentColor 25%, transparent); }
  .previews span { text-decoration: underline; text-underline-offset: 0.2em; }
  .previews small { opacity: 0.7; }
  p { margin: 0.25rem 0 0; }
  .links { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; margin-top: 0.75rem; }
  a { color: inherit; text-underline-offset: 0.2em; }
</style>
</head>
<body>
<h1>Apollo design-system previews</h1>
${rows}
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const brand = brandFor(req.url);
  if (!brand) {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(indexPage());
    }
    const file = req.url.startsWith('/_previews/') ? previewFile(req.url) : null;
    if (file) {
      res.writeHead(200, { 'content-type': MIME[extname(file)], 'cache-control': 'no-cache' });
      return res.end(readFileSync(file));
    }
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end(`No brand at ${req.url}. Brands: ${brands.map((b) => `/${b.slug}`).join(', ')}`);
  }
  const upstream = http.request(
    { host: '127.0.0.1', port: brand.port, method: req.method, path: req.url, headers: { ...req.headers, 'x-forwarded-host': req.headers.host ?? '' } },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`${brand.label} preview is not reachable on port ${brand.port} yet. It may still be starting; reload in a moment.`);
  });
  req.pipe(upstream);
});

// Websocket upgrades (Next's HMR) go to the brand's server as raw sockets.
server.on('upgrade', (req, socket, head) => {
  const brand = brandFor(req.url);
  if (!brand) return socket.destroy();
  const upstream = net.connect(brand.port, '127.0.0.1', () => {
    let request = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (let i = 0; i < req.rawHeaders.length; i += 2) request += `${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}\r\n`;
    upstream.write(`${request}\r\n`);
    if (head?.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on('error', () => socket.destroy());
  socket.on('error', () => upstream.destroy());
});

let shuttingDown = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shuttingDown = true;
    for (const child of children) child.kill('SIGTERM');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  });
}

for (const brand of brands) {
  if (await isListening(brand.port)) console.log(`[${brand.slug}] reusing the server already on port ${brand.port}`);
  else startBrand(brand);
}
server.listen(HUB_PORT, () => {
  console.log(`Apollo preview hub on http://localhost:${HUB_PORT}`);
  for (const brand of brands) console.log(`  ${brand.label}: http://localhost:${HUB_PORT}/${brand.slug}/overview`);
});
