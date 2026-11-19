#!/usr/bin/env node
// Browser smoke check for every brand preview, through the running hub.
//
//   npm run smoke                      # every brand in brands.json
//   npm run smoke -- splitbook         # one brand
//   npm run smoke -- hermes --route '/specimen?theme=hermes-light'   # extra routes, repeatable
//   npm run smoke -- --json            # machine-readable result on stdout
//
// Loads each route at 1440x900 and 390x844 in headless Chrome and fails (exit 1) on: a page or frame console error,
// an uncaught page error, a request that fails or returns >= 400, or a document wider than the viewport.
// Default routes per brand: /overview, /worlds, /design, /specimen, plus /design and /specimen in its defaultTheme.
// Needs the hub (`npm run preview`); dev-server errors are in preview-hub/logs/<slug>.log.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const hubDir = dirname(fileURLToPath(import.meta.url));
const brands = JSON.parse(readFileSync(join(hubDir, 'brands.json'), 'utf8'));
const HUB = `http://localhost:${process.env.HUB_PORT ?? 3000}`;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

const args = process.argv.slice(2);
const json = args.includes('--json');
const extraRoutes = args.flatMap((arg, i) => (args[i - 1] === '--route' ? [arg] : []));
const named = args.filter((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--route');
const unknown = named.filter((slug) => !brands.some((b) => b.slug === slug));
if (unknown.length) {
  console.error(`Unknown brand: ${unknown.join(', ')}. Brands: ${brands.map((b) => b.slug).join(', ')}.`);
  process.exit(2);
}
const selected = named.length ? brands.filter((b) => named.includes(b.slug)) : brands;

try {
  await fetch(`${HUB}/`);
} catch {
  console.error(`No preview hub at ${HUB}. Start it with \`npm run preview\`.`);
  process.exit(2);
}

const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
for (const brand of selected) {
  const routes = [
    '/overview',
    '/worlds',
    '/design',
    '/specimen',
    `/design?theme=${brand.defaultTheme}`,
    `/specimen?theme=${brand.defaultTheme}`,
    ...extraRoutes,
  ];
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await context.newPage();
      const problems = [];
      // HTTP failures are reported by the response listener with their URL; skip the browser's URL-less duplicate.
      page.on('console', (msg) => msg.type() === 'error' && !msg.text().startsWith('Failed to load resource') && problems.push(`console: ${msg.text()}`));
      page.on('requestfailed', (req) => !req.url().endsWith('/favicon.ico') && problems.push(`failed: ${req.url()} (${req.failure()?.errorText})`));
      page.on('response', (res) => res.status() >= 400 && !res.url().endsWith('/favicon.ico') && problems.push(`${res.status()}: ${res.url()}`));
      const url = `${HUB}/${brand.slug}${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 0) problems.push(`sideways scroll: document is ${overflow}px wider than the viewport`);
      } catch (error) {
        problems.push(`load: ${error.message.split('\n')[0]}`);
      }
      results.push({ brand: brand.slug, width: viewport.width, route, ok: problems.length === 0, problems });
      await page.close();
    }
    await context.close();
  }
}
await browser.close();

const failed = results.filter((r) => !r.ok);
if (json) console.log(JSON.stringify({ checked: results.length, failed: failed.length, results }, null, 2));
else {
  for (const r of failed) console.log(`FAIL ${r.brand} ${r.width} ${r.route}\n  ${r.problems.join('\n  ')}`);
  console.log(`${results.length - failed.length}/${results.length} loads clean (${selected.map((b) => b.slug).join(', ')} at ${VIEWPORTS.map((v) => v.width).join(' and ')} px).`);
}
process.exit(failed.length ? 1 : 0);
