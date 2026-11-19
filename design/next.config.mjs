import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the root so Next does not adopt a lockfile from a parent directory.
  turbopack: { root: appRoot },
  outputFileTracingRoot: appRoot,
};

export default nextConfig;
