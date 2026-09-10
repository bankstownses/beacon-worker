// This site uses real client-side routing (/Jobs, /Jobs/Create, etc.)
// via the History API, so any path that isn't an actual static file
// needs to fall back to index.html and let the app's own router take
// over from there -- otherwise Cloudflare just 404s on those paths.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const url = new URL(request.url);
      return env.ASSETS.fetch(new URL("/", url.origin));
    }
    return response;
  },
};
