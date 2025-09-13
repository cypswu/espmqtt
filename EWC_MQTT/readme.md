# IoT ProDeck v4.0 — 專案說明（User + Dev Handbook）

## 這是什麼？

**IoT ProDeck v4.0** 是一個以瀏覽器為主的 **PWA MQTT 控制台**：你可以連上 MQTT Broker、建立自訂控制面板（按鈕／開關／滑桿／顯示），並把不同裝置配置存成 Profiles 方便切換。介面上方有連線狀態與「連線／中斷」按鈕，下方有即時的訊息紀錄與吐司通知。 &#x20;

---

## 功能總覽

* **App Bar 與連線狀態**：標示「Disconnected / Reconnecting / Connected」，並自動啟停按鈕可用性。
* **分頁導覽**：控制 / 設定 兩大區。
* **控制分頁**

  * **門控專區**（若 Profile 內有群組「門控」會自動呈現）。
  * **自訂控制群組**：以卡片網格呈現，JS 動態渲染。
  * **快速指令（Quick Command）**：一鍵送 payload，可覆寫 QoS / Retain / Topic。&#x20;
* **控制項型別（4 種）**：Button／Toggle／Slider／Display（對應 UI 與行為皆已實作）。  &#x20;
* **Profiles**：建立、套用、刪除、匯入、匯出（匯出時自動移除密碼）。 &#x20;
* **資料保存**：Profiles 存 **IndexedDB**；最近使用設定存 **localStorage**。&#x20;
* **PWA 離線快取**：App Shell 採 Cache-first；其他請求採 Network-first 並寫回快取；Service Worker 開機即註冊。 &#x20;
* **Logger 與 Toast**：記錄 INFO/TX/RX/ERR，最多 500 筆；右上角吐司 5 秒自動消失。&#x20;

---

## 給使用者：快速上手

### 1) 安裝與開啟

* 直接以 HTTPS 部署此專案（MQTT over WSS 需要 TLS）。
* 瀏覽該站時，瀏覽器會自動註冊 Service Worker；也可將 PWA 安裝到裝置。

### 2) 建立連線設定

到「設定」分頁 → **連線設定**，填入：

* **Broker (WSS URL)**、**裝置 ID（用於主題模板 `{dev}`）**、**Client ID（可留空隨機）**、**使用者／密碼（選填）**。&#x20;
* 其餘選項：**Clean Session**、**Keepalive** 等（頁面載入時會以 localStorage 值或預設值回填）。

> 頁面中部的 Capsule 會即時顯示連線狀態，並控制「連線／中斷」按鈕可用性。

### 3) 設定主題與全域行為

在「主題與行為」區塊：

* **訂閱模板**預設 `devices/{dev}/commands`、**發佈模板**預設 `devices/{dev}/events`。
* 可設定 **前綴／後綴**、**全域發佈／訂閱 QoS**、**全域 Retain**。&#x20;

### 4) 新增控制項

在 **自訂控制管理器** 內點「新增控制項」：

* 選類型（Button/Toggle/Slider/Display）、群組、樣式（含自訂顏色）。&#x20;
* **Button**：輸入單次 payload。
* **Toggle**：設定 `payloadOn/payloadOff`，可加「狀態訂閱 Topic + Value Path」以回寫 UI。&#x20;
* **Slider**：Min/Max/Step、是否 **live**（拖曳就發）、可用 `payloadTpl`（例如 `{"brightness":{v}}`）。
* **Display**：設定 **訂閱 Topic + Value Path + 單位 + 連結**。&#x20;

> 控制面板渲染會依群組自動分卡，門控群組會顯示在專區。

### 5) 使用快速指令（Quick Command）

在控制分頁最下方的表單，輸入 **Payload**，必要時覆寫 **QoS/Retain/Topic**，按「送出」。&#x20;

### 6) 保存、切換與匯出 Profiles

* **儲存／套用／刪除**：介面內建對應按鈕與流程。&#x20;
* **匯出**：支援「目前」或「全部」，且**自動去除密碼欄位**以防洩漏。

### 7) 觀察 Logger 與 Toast

* Logger 每筆含時間、類型、內容；上限 **500** 筆，自動移除舊紀錄。
* Toast 5 秒後自動消失。

---

## 進階使用技巧

### A. Topic 模板與前後綴

* 函式會把模板中的 `{dev}` 替換為設定的裝置 ID，再與前綴／後綴拼接；控制項若有自訂 Topic 則優先使用。

### B. 狀態同步（RX → UI）

* **Toggle／Slider** 可指定「狀態訂閱 Topic + Value Path」，收到 JSON 後解析路徑並更新 UI。
* **Display** 以「訂閱 Topic + Value Path」顯示數值並可附連結。&#x20;
* 解析 JSON 路徑的工具函式 `getValueByPath()` 已內建。

### C. QoS 與 Retain

* 以**全域設定**為準；Quick Command 可就地覆寫 QoS/Retain。 &#x20;

### D. PWA 與離線行為

* App Shell（首頁、icons、manifest、`mqtt.min.js`）採 **Cache-first**。&#x20;
* 其他請求採 **Network-first**，若成功會寫回快取；離線時回退快取。
* Service Worker 於載入時註冊。

---

## 給開發者：技術說明

### 目錄與核心檔案

* `index.html`：UI／邏輯整合；含控制渲染、Profiles、持久化、連線與訊息處理。
* `sw.js`：PWA 快取策略與生命週期（install/activate/fetch）。&#x20;

### App 啟動流程

1. DOMContentLoaded → `init()`
2. 載入 localStorage／初始化 IndexedDB → 載入 Profiles → 綁定事件 → 更新連線狀態。

### MQTT 連線參數

* `clientId`（可留空隨機）、`clean`、`keepalive`、`reconnectPeriod = 5000ms`。
* 「連線／中斷」按鈕狀態與 Capsule 文案由 `updateConnectionStatus()` 控制。

### 控制渲染（範例）

* **Button**：單鍵觸發，支援自訂色。
* **Toggle**：原生 checkbox + CSS 開關；可為「勾選後」套用自訂色。
* **Slider**：`range` + 值顯示；`live` 時使用 `input` 事件持續發佈。
* **Display**：顯示值、可附外部連結（`noopener noreferrer`）。

### 資料持久化 API

* IndexedDB：`dbGet/dbSet/dbDelete`，Store 名稱 `kv`。
* localStorage：`iot-prodeck-settings-v4` 保存最近設定（含 broker/devId/帳密等）。

### Profiles 與匯入匯出

* 儲存至 `profile:{name}`；Profile 名稱清單存 `profileNames`；匯出時移除 `conn.password`。&#x20;

---

## 安全與隱私建議

* **密碼保存**：目前程式會把密碼放進 localStorage（`settings.password`）與 Profile（`conn.password`）中；雖然「匯出」會自動移除密碼，但日常持久化仍是明文，建議把密碼從持久化資料中排除或以 Web Crypto 加密後再存。 &#x20;
* **內容注入風險（Logger）**：Logger 目前以 `innerHTML` 注入訊息字串，若 payload 含 HTML 可能插入 DOM，建議改為 `textContent`。

---

## 疑難排解（Q\&A）

**Q1. 連不上 Broker？**

* 確認你使用 `wss://` URL 與正確的憑證、帳號密碼；表單在「連線設定」。&#x20;

**Q2. 已安裝 PWA，但內容沒更新？**

* 此 PWA 採 App Shell **Cache-first**；重新整理幾次或清空快取，或調整 SW 版本以觸發更新。

**Q3. 顯示元件沒數值？**

* 檢查是否設定了 **訂閱 Topic** 與 **Value Path**；確定 MQTT payload 是合法 JSON 且符合路徑。

**Q4. Toggle/Slider 的狀態無法回寫？**

* 為控制項指定 **狀態訂閱 Topic + Value Path**，并在 Broker 端回送對應狀態。

**Q5. QoS/Retain 要怎麼控制？**

* 預設使用**全域設定**；快速指令可單次覆寫 QoS/Retain。&#x20;

**Q6. 匯出檔找不到密碼？**

* 安全設計：匯出時會**自動去除密碼**欄位。

---

## 發佈與部署建議

* 以任何靜態網站伺服器（Nginx/Apache/Node 靜態伺服）在 **HTTPS** 下提供 `index.html`、`sw.js`、`manifest.webmanifest`、icons 與 `mqtt.min.js` 即可。App 啟動時會自動註冊 SW。&#x20;

---

## 版本資訊與路線圖（建議）

* 目前 cache 名稱為 `iot-prodeck-cache-v4`；未來若調整 App Shell，請同步 bump 版本。
* 可考慮新增：SW 導航請求的離線 fallback、更新提示（waiting → skipWaiting/clients.claim）。

---

### 附錄：UI 細節（樣式）

* Toggle／Slider 的樣式與行為（`input:checked`、thumb、track）已在 CSS 內定義。&#x20;
* 顏色主題（`--accent` 等）可於設定中即時調整並套用。&#x20;

---
