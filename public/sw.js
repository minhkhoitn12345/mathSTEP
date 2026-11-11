const CACHE_NAME = "mathstep-learning-v1";
const OFFLINE_SHELL = ["/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("mathstep-learning-") && key !== CACHE_NAME).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("authorization")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/") || url.pathname.startsWith("/leaderboard")) return;

  const isStaticAsset = url.pathname.startsWith("/_next/static/") || ["/favicon.ico", "/manifest.json"].includes(url.pathname);
  const isPublicLesson = url.pathname === "/" || url.pathname.startsWith("/learn/") || url.pathname.startsWith("/modules/");
  if (!isStaticAsset && !isPublicLesson) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (isStaticAsset) {
      const saved = await cache.match(request);
      if (saved) return saved;
    }
    try {
      const response = await fetch(request);
      const directives = response.headers.get("cache-control") || "";
      if (response.ok && response.type === "basic" && !/private|no-store/i.test(directives) && !response.headers.has("set-cookie")) {
        event.waitUntil(cache.put(request, response.clone()));
      }
      return response;
    } catch {
      return (await cache.match(request)) || (request.mode === "navigate" ? await cache.match("/") : undefined) || Response.error();
    }
  })());
});
