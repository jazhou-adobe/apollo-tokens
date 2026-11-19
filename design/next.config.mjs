import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('.', import.meta.url));

// The preview is served under this path, standalone (http://localhost:3200/splitbook) and behind the hub that proxies
// /splitbook/* to it. Single source of truth: exposed to code as process.env.BASE_PATH (see preview/paths.ts).
const basePath = '/splitbook';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: { BASE_PATH: basePath },
  // Pin the root so Next does not adopt a lockfile from a parent directory.
  turbopack: { root: appRoot },
  outputFileTracingRoot: appRoot,
};

export default nextConfig;
