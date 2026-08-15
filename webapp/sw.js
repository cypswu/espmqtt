importScripts("version.js");

const CACHE = "esp-webapp-" + APP_VERSION;
const ASSETS = ["./", "./index.html", "./version.js", "./mqtt.min.js",
                "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  // cache:"reload" 繞過 HTTP 快取（GitHub Pages 有 10 分鐘 max-age），
  // 確保新版快取裝進去的一定是剛部署的檔案
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(ASSETS.map((u) => c.add(new Request(u, { cache: "reload" }))))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // 配置檔走網路優先，改了 configs/ 不必等 App 改版
  if (url.pathname.includes("/configs/")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
