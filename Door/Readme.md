# ESP32-C3 Gate Panel（相容版）使用手冊

**版本：v2.8.0-compat（PWA 可安裝）**

這是一個針對鐵捲門/門控情境打造的 **Web 前端控制台**。支援行動裝置操作、可編輯 MQTT 主題模板、**多組設定（Profiles）**、本機保存（localStorage + IndexedDB），並可安裝為 **PWA** 離線網頁應用（僅離線快取 UI，不代表可離線控制）。

---

## 目錄

* [功能一覽](#功能一覽)
* [檔案結構](#檔案結構)
* [安裝與部署](#安裝與部署)
* [首次啟用步驟](#首次啟用步驟)
* [主題模板（重要）](#主題模板重要)
* [多組設定（Profiles）](#多組設定profiles)
* [資料保存位置與匯入匯出](#資料保存位置與匯入匯出)
* [操作說明](#操作說明)
* [PWA 安裝（可選）](#pwa-安裝可選)
* [更新版本與快取](#更新版本與快取)
* [常見問題 FAQ / Troubleshooting](#常見問題-faq--troubleshooting)
* [安全建議](#安全建議)
* [自訂與進階](#自訂與進階)
* [相容性與限制](#相容性與限制)
* [版本資訊](#版本資訊)

---

## 功能一覽

* ✅ **行動裝置友善**：大按鈕、對比清楚、固定頂欄。
* ✅ **可編輯主題模板**：支援變數 `{dev}`，若裝置 ID 留空會自動去掉該層。
* ✅ **即時預覽**：畫面即時顯示訂閱與發佈的「實際主題」。
* ✅ **多組設定（Profiles）**：新增/套用/覆寫/刪除/匯入/匯出。
* ✅ **本機保存**：`localStorage`（即時）＋ `IndexedDB`（完整設定）。
* ✅ **自動安全換訂閱**：連線中改主題或裝置 ID，會先退舊再訂新。
* ✅ **完整日誌**：連線、訂閱、發佈、收訊息均寫入，可清除（最多 500 筆）。
* ✅ **PWA 安裝**（可選）：加入桌面、啟動更快、基本離線快取 UI。

---

## 檔案結構

把以下檔案放在**同一資料夾**（同一網域）：

```
index.html          ← 主頁（v2.8.0-compat）
mqtt.min.js         ← 本地 mqtt.js（請從官方/UNPKG 下載後放本地）
manifest.webmanifest← PWA 設定檔（可選）
sw.js               ← Service Worker（可選）
icon-192.png        ← PWA 圖示（建議 192×192）
icon-512.png        ← PWA 圖示（建議 512×512）
```

---

## 安裝與部署

**必須使用 HTTP(S) 伺服器開啟**（`file://` 無法註冊 PWA，也可能受瀏覽器限制）：

* 簡易本機（Python）

  * Windows（PowerShell）：`py -m http.server 8080`
  * macOS/Linux（Terminal）：`python3 -m http.server 8080`
    開啟 `http://localhost:8080/`

* 正式部署：建議使用 **HTTPS** 網站，因為你通常會連 **WSS** MQTT Broker。

---

## 首次啟用步驟

1. 開啟頁面 → 於 **Broker (WSS)** 填入你的 MQTT 端點，例如：
   `wss://your-broker.example.com:443/mqtt`
2. 視需求填入 **裝置 ID**（可留空）與 **Client ID**（留空會自動產生）。
3. 調整 **主題模板**（見下一節），確認底下「實際主題」預覽正確。
4. 按 **連線**。成功後狀態燈變綠（Connected），日誌會顯示 Connected / Subscribed 等訊息。

---

## 主題模板（重要）

* **可用變數**：`{dev}`
* **規則**：若裝置 ID 留空，模板內的 `/{dev}` 這層會自動被移除；多餘斜線也會自動清理。
* **範例**

  * 訂閱：`esp32c3/{dev}/status`
  * 發佈：`esp32c3/{dev}/cmd`
  * 若裝置 ID = `gateA` → 實際訂閱 `esp32c3/gateA/status`、發佈 `esp32c3/gateA/cmd`
  * 若裝置 ID 空白 → 實際訂閱 `esp32c3/status`、發佈 `esp32c3/cmd`

> **貼心提醒**：畫面下方會即時顯示「目前實際訂閱 / 發佈」主題，請以此為準。

---

## 多組設定（Profiles）

用來保存多種場景（不同 Broker、不同門位/主題）的配置。

### 可做的事

* **儲存/覆寫**：輸入「設定檔名稱」→ 按「儲存/覆寫」。
* **套用**：從「目前設定檔」下拉選擇即可；若已連線會自動退訂/訂閱新主題。
* **刪除**：選擇後按「刪除」。
* **匯出**：將所有 Profiles 另存成 `gate-profiles.json`。
* **匯入**：載入 `.json` 檔即可（支援前版/純物件格式）。

---

## 資料保存位置與匯入匯出

* **localStorage**（即時保存欄位）

  * `mqtt.host`、`mqtt.dev`、`mqtt.cid`、`mqtt.tplSub`、`mqtt.tplPub`
  * `mqtt.lastProfile`（最後一次使用的設定檔名稱）

* **IndexedDB**（完整設定）

  * DB：`gate_cfg_db`，Store：`kv`
  * `profileNames`: `["西側門","東側門",...]`
  * `profile:<名稱>`:

    ```json
    {
      "host": "wss://…",
      "dev": "gateA",
      "cid": "gp-xxxx",
      "tplSub": "esp32c3/{dev}/status",
      "tplPub": "esp32c3/{dev}/cmd"
    }
    ```

* **匯出/匯入**

  * 匯出時產生：

    ```json
    {
      "version": "v280",
      "profiles": {
        "西側門": { "host":"…", "dev":"…", "cid":"…", "tplSub":"…", "tplPub":"…" },
        "東側門": { … }
      }
    }
    ```
  * 匯入支援上面格式，或直接 `{ "西側門": {…}, "東側門": {…} }`

---

## 操作說明

* **門控按鈕**：

  * 外門開 `D1O`、外門關 `D1C`、內門開・關 `D2I`、內門停止 `D2S`
* **LED 測試**：`on` / `off`
* **自訂訊息**：任意文字直接發佈到「發佈主題」
* **鍵盤快速鍵（桌面）**：

  * `C` 連線/中斷
  * `1` `2` `3` `4` → 對應 `D1O`/`D1C`/`D2I`/`D2S`
  * `L` / `K` → `on` / `off`

---

## PWA 安裝（可選）

若要「安裝到桌面」並啟用基礎離線快取（UI 快取）：

1. 確認資料夾含：`manifest.webmanifest`、`sw.js`、`icon-192.png`、`icon-512.png`。
2. 在 `index.html` 的 `<head>` 中加入：

   ```html
   <link rel="manifest" href="manifest.webmanifest">
   <meta name="theme-color" content="#0b1020">
   <link rel="icon" href="icon-192.png" sizes="192x192">
   <link rel="apple-touch-icon" href="icon-192.png">
   ```
3. 在 `index.html` 底部加入註冊碼（或放在現有 JS 中）：

   ```html
   <script>
   if ("serviceWorker" in navigator) {
     window.addEventListener("load", () => {
       navigator.serviceWorker.register("sw.js").catch(err => console.error("SW register failed:", err));
     });
   }
   </script>
   ```
4. 以 **HTTPS 或 [http://localhost](http://localhost)** 開啟 → 瀏覽器選單出現「安裝」即可。

> PWA 僅快取頁面與靜態資源，不會在「無網路」時連到 MQTT（WSS 必須連得上）。

---

## 更新版本與快取

* 每次更新檔案時，請**修改 `sw.js` 的 `CACHE` 名稱**（例如 `gate-pwa-v280-1` → `gate-pwa-v280-2`），確保用戶拿到新版本。
* 使用者若遇到舊畫面：DevTools → Application → Service Workers → **Unregister**，再重整一次。

---

## 常見問題 FAQ / Troubleshooting

**Q1. 按鈕沒反應、日誌沒新訊息？**

* 多半是 `mqtt.min.js` 沒載到或被 CSP 限制。請確認：

  * `mqtt.min.js` 與 `index.html` 同資料夾，並以 `<script src="mqtt.min.js"></script>` 載入。
  * DevTools → Network：檢查 `mqtt.min.js` 200 成功。
  * 若頁面曾安裝 PWA，請更新 `sw.js` 的 `CACHE` 或清除舊 SW。

**Q2. 連線失敗？**

* 確認 Broker 使用 **WSS**（`wss://`），且網路允許該連接埠（常見 443 / 8081 / 8084）。
* **HTTPS 頁面 + `ws://`** 會被瀏覽器擋，請改用 `wss://`。
* 憑證需正確（網域匹配、未過期）。內網自簽憑證可能導致瀏覽器拒絕。

**Q3. 換了主題模板或裝置 ID，訊息仍跑到舊主題？**

* 已處理「安全換訂閱」。若你看到例外，請重新連線或檢查日誌中是否有 `已切換訂閱：...` 訊息。

**Q4. 手機體驗？**

* 已針對行動裝置設計（大按鈕、單欄優先）。若仍太擁擠，可在小螢幕刪除不常用區塊或調高字級。

**Q5. 退出/重進頁面設定不見？**

* `localStorage` 會即時保存最近一次的欄位值；完整配置請用 **Profiles** 儲存到 IndexedDB。
* 也可使用「匯出 JSON」在不同瀏覽器/裝置之間搬移。

---

## 安全建議

* **務必使用 WSS** 與合法憑證。
* 為 MQTT Broker 設置 **帳密/憑證** 與 **ACL 主題權限**。
* 控制主題（發佈）與狀態主題（訂閱）請分清，避免被他人誤用。
* Client ID 應唯一（本工具會自動隨機前綴）。
* 公用測試 broker（例如 `test.mosquitto.org`）**僅作測試**，請勿用於正式控制。

---

## 自訂與進階

* **改按鈕對應 payload**：在 `index.html` 內的 JS 尋找 `publish('D1O')` 等字樣，即可調整。
* **改預設主題/樣式**：

  * 預設模板在 `tplSub` / `tplPub` 的 `value`。
  * 色彩在 CSS `:root` 變數內。
* **變數擴充**：目前支援 `{dev}`。若要 `{ns}` / `{site}` 等，可在程式內 `renderTpl()` 擴充替換邏輯。

---

## 相容性與限制

* 現代瀏覽器（Chrome/Edge/Safari/Firefox）皆可；內建舊瀏覽器可能不支援部分 API。
* PWA 需要 HTTPS 或 `http://localhost`。
* 日誌最多保留 500 筆。
* 離線時 PWA 只能開啟 UI；**MQTT 需要網路**。

---

## 版本資訊

* **v2.8.0-compat**

  * 專業 UI / 手機友善
  * 可編輯主題模板（`{dev}`）
  * Profiles（IndexedDB）＋ localStorage 即時保存
  * 連線中變更主題會「安全換訂閱」
  * 支援 PWA（`manifest.webmanifest` + `sw.js`）

---

### 聯絡/維護

* 建議在日誌區貼上錯誤訊息或擷圖，便於快速定位（如：`mqtt.js 未載入`、`Subscribe failed`、`MQTT error`）。
* 若要擴充功能（多變數模板、群組、長按確認、手機震動回饋等），可在此版上繼續開發。
