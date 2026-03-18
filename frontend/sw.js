const CACHE_NAME = "ruyayorum-v2";
const OFFLINE_URL = "/offline.html";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/auth.html",
  "/auth.js",
  "/admin.html",
  "/admin.js",
  "/profile.html",
  "/profile.js",
  "/support.html",
  "/support.js",
  "/gizlilik.html",
  "/cerez-politikasi.html",
  "/kullanim-kosullari.html",
  "/kvkk.html",
  "/yasal-uyari.html",
  "/robots.txt",
  "/sitemap.xml",
  "/offline.html",
  "/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return res;
    }).catch(() => caches.match(OFFLINE_URL)))
  );
});
