/** @type {import('next').NextConfig} */
const nextConfig = {
  /* @openrouter/sdk's streaming-response detection relies on
     `constructor.name === 'EventStream'` at runtime (see
     node_modules/@openrouter/sdk/esm/lib/model-result.js). Next.js's
     production bundler minifies class names for anything it bundles,
     which silently breaks that check — the SDK then can't recognize a
     legitimate streaming response and throws "Unexpected response type
     from API". This was reproducing 100% of the time in production
     (never locally, where dev builds aren't minified) on every agent run
     that needed a tool call. Keeping the package external makes Next.js
     `require()` it unmodified from node_modules at runtime instead of
     bundling/minifying it. */
  serverExternalPackages: ["@openrouter/sdk"],
};

export default nextConfig;
