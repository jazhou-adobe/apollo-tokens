// The preview is served under a fixed Next.js basePath (next.config.mjs → env.BASE_PATH), so a hub can mount it at
// /hermes. next/link and next/font apply the basePath themselves; raw anchors, iframes, and links built from strings go
// through withBase.
export const withBase = (path: string) => `${process.env.BASE_PATH ?? ''}${path}`;
