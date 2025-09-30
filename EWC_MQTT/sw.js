/* IoT ProDeck - PWA Caching Logic */
// sw.js 頂端（前後文錨點：其他 const 之前）
const params = new URL(self.location).searchParams;
const SW_VERSION = params.get('v') || '1';
const CACHE_PREFIX = 'pwa-cache-';
const CACHE_NAME = `${CACHE_PREFIX}${SW_VERSION}`;

// 定義 App Shell 的核心資源
const APP_SHELL = [
  './',
  './index.html',
  './mqtt.min.js',
  './manifest.webmanifest'
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

// install 事件：在 Service Worker 安裝時，快取 App Shell 資源
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(APP_SHELL);
    })
  );
  // 強制等待中的 Service Worker 立即變為啟用狀態
  self.skipWaiting();
});

// activate 事件：在 Service Worker 啟用時，清理舊版本的快取
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // 如果快取名稱不是目前的版本，就刪除它
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // 讓 Service Worker 立即控制所有客戶端
  return self.clients.claim();
});

// fetch 事件：攔截網路請求，並根據資源類型採用不同快取策略
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 僅處理同源請求
  if (url.origin === location.origin) {
    // 對於 App Shell 內的資源，採用 "Cache-first" 策略
    // 這裡檢查路徑是否完全匹配 APP_SHELL 中的任一項
    // new URL(item, self.location.href).pathname 用於將相對路徑轉為絕對路徑以進行比較
    const isAppShellResource = APP_SHELL.some(item => new URL(item, self.location.href).pathname === url.pathname);
    
    if (isAppShellResource) {
      e.respondWith(
        caches.match(e.request).then((response) => {
          // 如果快取中有，直接回傳；否則，從網路請求
          return response || fetch(e.request);
        })
      );
      return;
    }
  }

  // 對於所有其他請求（例如未在快取列表中的同源請求或跨域請求）
  // 採用 "Network-first" 策略
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // 成功從網路取得回應
        // 複製一份回應，因為 request 和 response stream 只能被使用一次
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // 將新的回應存入快取
          cache.put(e.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // 當網路請求失敗時 (例如離線)，嘗試從快取中尋找備份
        return caches.match(e.request);
      })
  );
});
