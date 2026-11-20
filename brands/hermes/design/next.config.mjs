import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('.', import.meta.url));

// The preview lives under /hermes so one hub server can proxy both brand previews by path. Single source of truth:
// Next applies it to routes, next/link, and next/font; preview/paths.ts reads it back as process.env.BASE_PATH.
const basePath = '/hermes';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: { BASE_PATH: basePath },
  // Pin the root so Next does not adopt a lockfile from a parent directory.
  turbopack: { root: appRoot },
  outputFileTracingRoot: appRoot,
  // Next.js nudges coding agents when the installed version has a security advisory (set by `next upgrade --agent=security`).
  experimental: { agentUpgrade: 'security' },
};

export default nextConfig;
