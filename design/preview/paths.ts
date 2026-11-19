// The preview is served under a Next.js basePath (next.config.mjs → env.BASE_PATH, '/splitbook'). next/link adds it on
// its own; raw <a href>, iframe src, and anything built from strings must go through withBase.
export const withBase = (path: string) => `${process.env.BASE_PATH ?? ''}${path}`;
