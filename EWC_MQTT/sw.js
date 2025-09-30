/* IoT ProDeck — Service Worker (穩定版)
 * 重點：
 *  1) 以 sw.js?v=APP_VERSION 帶入快取版號（不用手動改多處）
 *  2) APP_SHELL 清單使用相對路徑 ./，在 GitHub Pages 子路徑也正確
 *  3) 安裝：預先快取 App Shell；啟用：清理舊版快取並接管頁面
 *  4) 取用策略：App Shell → Cache First；其他 → Network First（失敗回快取）
 *  5) 只快取 GET & 只在 response.ok 時寫入（避免髒資料）
 *  6) 提供 SKIP_WAITING 訊息通道（可由頁面觸發「立即使用新版」）
 *  7) 可選：Navigation Preload（加速第一屏）
 */

/* -------------------------
 * 1) 版本與快取名稱
 * ------------------------- */
// ★ 注意：在 SW 裡要用 self.location.href（字串）再丟進 URL()；
//         直接 new URL(self.location) 有瀏覽器會丟錯，導致「script evaluation failed」。
let SW_VERSION = '1';
try {
  const url = new URL(self.location.href);
  SW_VERSION = url.searchParams.get('v') || SW_VERSION;
} catch (e) {
  // 保留預設
}

const CACHE_PREFIX = 'pwa-cache-';
const CACHE_NAME   = `${CACHE_PREFIX}${SW_VERSION}`;

/* -------------------------
 * 2) App Shell（核心檔案）
 *    用 ./ 開頭的相對路徑，會以 SW 的 scope 當基準
 * ------------------------- */
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './mqtt.min.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

/* （可選）離線備援頁：若你有 offline.html 就打開這段 */
const OFFLINE_URL = null; // 例：'./offline.html'
if (OFFLINE_URL) APP_SHELL.push(OFFLINE_URL);

/* -------------------------
 * 3) install：預先快取 App Shell
 * ------------------------- */
self.addEventListener('install', (event) => {
  console.log('[SW] install', { CACHE_NAME, SW_VERSION });
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  // 讓新 SW 進入 waiting 狀態（等待 activate）
  self.skipWaiting();
});

/* -------------------------
 * 4) activate：清理舊快取 & 接管頁面
 * ------------------------- */
self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(
    (async () => {
      // 可選：開啟 Navigation Preload（HTTP/2 伺服器上可加速導航）
      try { await self.registration.navigationPreload?.enable(); } catch (e) {}

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME) // 只刪自家前綴
          .map((k) => {
            console.log('[SW] delete old cache', k);
            return caches.delete(k);
          })
      );
      await self.clients.claim(); // 立刻控制所有 client
    })()
  );
});

/* -------------------------
 * 5) fetch：取用策略
 *    - 只處理 GET（避免把 POST/PUT 等不可重放請求放入快取）
 *    - 同源且屬於 App Shell → Cache First
 *    - 其他 → Network First（失敗回快取；導覽請求可回離線頁）
 * ------------------------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 判斷是否為 App Shell 資源（用 scope + 相對路徑比對）
  const isShell = sameOrigin && APP_SHELL.some(
    (p) => new URL(p, self.location.href).pathname === url.pathname
  );

  if (isShell) {
    // ★ App Shell：Cache First → 快
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // 其餘：Network First（新）→ 失敗回快取（穩）
  event.respondWith((async () => {
    // 可用 navigation preload 的預取回應（若啟用）
    const preload = await event.preloadResponse;

    try {
      const netRes = preload || await fetch(req);
      // 僅在 200-299 時寫入快取；且只快取同源（避免把外站大量塞入）
      if (sameOrigin && netRes && netRes.ok) {
        const copy = netRes.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
      }
      return netRes;
    } catch (err) {
      // 網路失敗 → 回快取
      const cached = await caches.match(req);
      if (cached) return cached;

      // 若是導覽請求（HTML），且有離線備援頁 → 回離線頁
      if (OFFLINE_URL && req.mode === 'navigate') {
        const offline = await caches.match(OFFLINE_URL);
        if (offline) return offline;
      }
      throw err;
    }
  })());
});

/* -------------------------
 * 6) 訊息通道：讓頁面要求「立即套用新版」
 *    用法（頁面端）：
 *      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
 * ------------------------- */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING requested by client');
    self.skipWaiting();
  }
});
