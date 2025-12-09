# EWC_Template - 使用與維護手冊

本文件包含 **使用者操作手冊** 與 **代碼維護手冊** 兩大部分。

---

# PART 1: 使用者操作手冊 (User Operation Manual)

## 1. 產品簡介
**EWC_Template** 是一款基於 ESP8266 (ESP-01M) 或 ESP32-C3 的物聯網測試裝置。它具備以下核心功能：
- **MQTT 通訊**: 支援標準 MQTT 協定，可發送狀態 (State)、事件 (Event) 並接收指令 (Cmd)。
- **WebPush 推播**: 支援 Web Push API，可將重要事件推播至手機或電腦瀏覽器。
- **Wi-Fi Portal**: 內建 Captive Portal，無需寫程式即可透過手機設定 Wi-Fi 與 MQTT 參數。
- **TLS 安全連線**: 支援 MQTTS (TLS 1.2) 加密連線與伺服器憑證驗證。
- **LED 控制**: 支援多通道 LED 控制 (狀態燈、RGBW)，具備呼吸、漸變、閃爍等特效。

## 2. 快速安裝指南

### 步驟 1: 上電啟動
接上電源 (3.3V 或 5V，視硬體而定)。
- **首次使用**: 裝置會自動進入 AP 模式 (LED 可能會快閃或恆亮)。
- **正常使用**: 裝置會嘗試連線 Wi-Fi，成功後 LED 會熄滅 (或依設定狀態顯示)。

### 步驟 2: 連線設定熱點
使用手機或電腦搜尋 Wi-Fi，名稱格式為：
- **`EWC-xxxxxx`** (例如 `EWC-A1B2C3`)
- 預設無密碼 (或依出廠設定)。

### 步驟 3: 進入設定頁面 (Portal)
連線後，手機通常會自動跳出登入畫面。若無，請開啟瀏覽器輸入：
- **`http://192.168.4.1`**

點選 **"Configure WiFi"** 進入設定選單。

## 3. 參數設定詳解

在 Portal 設定頁面中，您需要填寫以下參數：

| 參數名稱 | 欄位說明 | 範例 / 備註 |
| :--- | :--- | :--- |
| **SSID** | Wi-Fi 名稱 | 點選掃描到的基地台 |
| **Password** | Wi-Fi 密碼 | 輸入 Wi-Fi 密碼 |
| **deviceId** | 裝置 ID (唯一識別碼) | `esp01m-001` (預設為 MAC 後六碼) |
| **mqttHost** | MQTT 伺服器位址 | `broker.emqx.io` 或 IP |
| **mqttPort** | MQTT 埠號 | `1883` (非加密) 或 `8883` (TLS) |
| **mqttSecure** | 是否啟用 TLS 加密 | `0` (否) 或 `1` (是) |
| **tlsVerify** | 是否驗證伺服器憑證 | `0` (否) 或 `1` (是，需上傳 CA) |
| **mqttUser** | MQTT 帳號 | 若無則留空 |
| **mqttPass** | MQTT 密碼 | 若無則留空 |
| **baseTopic** | MQTT 主題前綴 | `ewc/devices` |
| **ledPin** | LED GPIO 腳位 | `2` (ESP-01M 通常是 2) |
| **ledActiveHigh**| LED 高電位觸發 | `0` (低電位亮) 或 `1` (高電位亮) |
| **portalPass** | AP 設定密碼 | 設定後，下次連 AP 需輸入此密碼 (>=8碼) |
| **pushToken** | WebPush Token | 填入 Token 以更新，填入 `delete` 以刪除，留空則保留原值 |
| **heartbeat** | 每日心跳時間 (HH:MM) | `09:00` (每日早上九點發送心跳) |
| **Factory Reset**| 恢復原廠設定 | 勾選並儲存，裝置將清除所有設定 (含 LED) 並重啟 |

設定完成後點選 **"Save"**，裝置將自動重啟並嘗試連線。

## 3.1 Web OTA 韌體更新 (New)

在 Portal 設定頁面底部，新增了 **"Firmware Update"** 按鈕。
1.  點選按鈕進入更新頁面。
2.  選擇編譯好的 `.bin` 韌體檔案。
3.  點選 **Update**，等待上傳完成。
4.  顯示 "OK" 後裝置將自動重啟。

## 4. 操作指南

### 4.1 MQTT 主題與指令
裝置上線後，會依照 `baseTopic/deviceId` 訂閱與發布主題。假設設定為：
- Base Topic: `ewc/devices`
- Device ID: `dev01`

| 類型 | 主題 (Topic) | 方向 | 說明 |
| :--- | :--- | :--- | :--- |
| **狀態** | `ewc/devices/dev01/state` | 裝置 -> Broker | 發送上線狀態 `{"online":true}` 或心跳 |
| **事件** | `ewc/devices/dev01/event` | 裝置 -> Broker | 發送按鈕、感測器等即時事件 |
| **指令** | `ewc/devices/dev01/cmd` | Broker -> 裝置 | 接收控制指令 |

#### 常用 MQTT 指令 (發送至 `.../cmd`)
| 指令 (Payload) | 說明 | 範例 |
| :--- | :--- | :--- |
| `ping` | 測試連線 | 回覆 `pong` |
| `led.on` | 開啟狀態 LED | `led.on` |
| `led.off` | 關閉狀態 LED | `led.off` |
| `led.save` | 儲存 LED 設定 | `led.save` (將目前 RGBW 設定寫入 Flash) |
| `led.show` | 顯示 LED 狀態 | `led.show` (回傳各通道狀態) |
| `led.help` | 顯示 LED 指令列表 | `led.help` (回傳指令說明) |
| `led.test [p1] [p2] [p3] [p4]` | 測試 RGBW 呼吸燈 | `led.test` (預設) 或 `led.test 4 5 12 14` |
| `rgbw.set <r> <g> <b> <w>` | 設定 RGBW 顏色 | `rgbw.set 255 0 0 0` (紅光) |
| `[ch].val <v>` | 設定亮度 (0-100) | `r.val 100`, `g.val 50` |
| `[ch].breathe <min> <max> <ms>` | 呼吸燈 | `r.breathe 10 100 2000` (2秒週期) |
| `[ch].fade <from> <to> <ms>` | 漸變燈 | `g.fade 0 100 1000` (1秒漸亮) |
| `[ch].blink <val> <on> <off>` | 閃爍 | `b.blink 100 200 200` (快閃) |
| `push` | 發送 WebPush 測試 | `push` 或 `push 標題|內容` |
| `pina<n>` | 讀取 Analog GPIO <n> | `pina0` (A0), `pina34` |
| `pin<n>.on` | 設定 GPIO <n> 為 HIGH | `pin12.on` |
| `pin<n>.off` | 設定 GPIO <n> 為 LOW | `pin12.off` |
| `portal` | 強制開啟設定頁面 | `portal` (裝置將斷線並開啟 AP) |
| `sys.reboot` | 遠端重啟 | `sys.reboot` |
| `sys.ver` | 查詢版本 | `sys.ver` |
| `wifi.status` | 查詢 Wi-Fi 狀態 | `wifi.status` (回傳 SSID/IP/RSSI) |
| `time.now` | 查詢目前時間 | `time.now` |
| `cfg.show` | 查詢目前設定 | `cfg.show` |
| `sys.reset force` | 恢復原廠設定 | 需加 force 參數以防誤觸 |
| `push.cfg <k> <v>` | 設定推播開關 | `push.cfg boot on`, `push.cfg conn off` |
| `push.group <list>`| 設定推播過濾 | `push.group led,pin 2` (只推播 led 與 pin 2 相關指令) |
| `sys.ota <url>` | 自動化 OTA 更新 | `sys.ota http://192.168.1.10/new.bin` |

> **備註**: `[ch]` 可為 `r`, `g`, `b`, `w` 或 `led` (狀態燈)。

## 自動化 OTA 更新 (Auto 2-Stage OTA)

由於 ESP8266 (1MB Flash) 空間限制，本專案採用「兩階段更新」機制。
您只需發送一次指令，系統會自動完成以下步驟：
1.  下載並切換至 **Minimal Loader** (中繼韌體)。
2.  Loader 自動下載您指定的 **新版韌體**。
3.  重啟進入新版韌體。

### 準備工作
1.  **編譯 Loader**: 開啟 `tools/MinimalLoader/MinimalLoader.ino`，編譯並匯出為 `MinimalLoader.bin`。
2.  **準備韌體**: 編譯主程式 `EWC_Template.ino`，匯出為 `firmware.bin`。
3.  **架設伺服器**: 將上述兩個檔案放在 HTTP 伺服器 (例如 `http://192.168.1.10/`)。
4.  **設定 Loader URL** (建議): 在 `cfg.json` 中設定 `"otaLoaderUrl": "http://192.168.1.10/MinimalLoader.bin"`，或透過 `sys.ota` 第二個參數指定。

### 執行更新
透過 MQTT 或 Serial 發送：
```
sys.ota http://192.168.1.10/firmware.bin
```
若未設定預設 Loader URL，則需指定：
```
sys.ota http://192.168.1.10/firmware.bin http://192.168.1.10/MinimalLoader.bin
```

### 4.2 序列埠指令 (Serial Console)
透過 USB 轉 TTL 線連接裝置 (波特率 **115200**)，可使用以下指令：

*   `help` / `?` : 顯示指令列表
*   `help.push` : 顯示 WebPush 指令列表
*   `help.led` : 顯示 LED 指令列表
*   `wifi.status` : 顯示 Wi-Fi 狀態 (IP, RSSI)
*   `portal` : 強制開啟 Config Portal (清除設定)
*   `mqtt.status` : 顯示 MQTT 連線狀態與主題
*   `mqtt.reconnect` : 強制重連 MQTT
*   `mqtt.pub <t>|<p>` : 發布 MQTT 訊息
*   `mqtt.sub <t>` : 訂閱 MQTT 主題
*   `mqtt.unsub <t>` : 取消訂閱
*   `led.on` / `led.off` : 控制狀態 LED
*   `led.save` : 儲存 LED 設定
*   `led.show` : 顯示 LED 狀態
*   `led.test [p1..p4]` : 測試 RGBW 呼吸燈
*   `sys.reset` : 恢復原廠設定 (清除 Config & LED)
*   `sys.reboot` : 重啟裝置
*   `sys.ver` : 顯示版本號
*   `pin<n>.on` / `pin<n>.off` : 控制 GPIO
*   `pina<n>` : 讀取 Analog GPIO (例如 `pina0`)
*   `push <title>|<body>` : 發送 WebPush 測試
*   `time.sync` : 同步 NTP 時間
*   `time.now` : 顯示目前時間
*   `tls?` : 顯示 TLS 狀態
*   `cfg.show` : 顯示目前設定值

## 5. 故障排除 (Troubleshooting)

| 問題現象 | 可能原因 | 解決方法 |
| :--- | :--- | :--- |
| **無法連上 Wi-Fi** | SSID/密碼錯誤、訊號太弱 | 使用 `portal` 指令重設，或檢查 AP 距離 |
| **MQTT 連線失敗** | Host/Port 錯誤、防火牆阻擋 | 檢查 `cfg.show` 設定，確認 Broker 可連線 |
| **TLS 連線失敗** | 憑證錯誤、時間未同步 | 確認 `tlsVerify` 設定，檢查 `time.now` 是否正確 |
| **一直重啟 (Crash)** | 電源不足、WDT 觸發 | 更換穩定電源 (至少 500mA)，檢查 Log 錯誤碼 |

## 6. 驗證計畫 (Verification Plan)

為確保裝置功能正常，建議依序執行以下測試：

### 6.1 Wi-Fi 與連線測試
1.  **配網測試**: 重置裝置 (`sys.reset force`)，連線 `EWC-xxxxxx` 熱點，設定 Wi-Fi 與 MQTT。
2.  **連線確認**: 儲存後裝置重啟，觀察 Serial Log 或路由器，確認取得 IP。
3.  **斷線重連**: 關閉路由器 Wi-Fi 訊號，等待 1 分鐘後開啟，確認裝置能自動重連。

### 6.2 MQTT 功能測試
1.  **狀態回報**: 訂閱 `ewc/devices/+/state`，確認收到 `{"online":true}`。
2.  **指令控制**: 發送 `ping` 到 `.../cmd`，確認收到 `pong` 回應。
3.  **LED 控制**: 發送 `led.on` 與 `led.off`，確認實體 LED 亮滅且 MQTT 回傳 `ok`。

### 6.3 推播通知測試 (WebPush)
1.  **開機推播**: 確保 `push.cfg boot on`，重啟裝置，確認收到 "System Boot" 通知。
2.  **連線推播**: 設定 `push.cfg conn on`，重連 MQTT，確認收到 "mqtt.connected" 通知。
3.  **指令推播過濾**:
    - 設定 `push.group led` (只推播 LED 指令)。
    - 發送 `led.on` -> **應收到** 推播。
    - 發送 `ping` -> **不應收到** 推播。
    - 設定 `push.group clear` (關閉指令推播)。
    - 發送 `led.off` -> **不應收到** 推播。

### 6.4 LED 指示燈測試
1.  **連線爆閃**: 裝置開機連上 MQTT 瞬間，LED 應快速爆閃 3 次 (Burst Mode)。
2.  **手動控制**: 發送 `led.on` 讓燈亮起。
3.  **活動互斥**: 在燈亮狀態下發送 `ping` (產生 MQTT 活動)，LED **應保持亮起**，不應熄滅 (已修正舊版問題)。

---

# PART 2: 代碼維護手冊 (Code Maintenance Manual)

## 1. 系統架構
本專案採用模組化設計，主要由以下元件組成：

- **EWC_Template.ino**: 主程式入口，負責初始化與主迴圈調度。
- **MqttBus**: 核心匯流排，封裝 PubSubClient，處理連線退避、狀態管理與訊息派發。
- **WifiPortal**: 封裝 WiFiManager，處理配網與參數設定介面。
- **WebPush**: 處理 Web Push API 請求，包含加密與佇列管理。
- **TlsHelper**: 處理 BearSSL / WiFiClientSecure 的憑證載入與設定。
- **ConfigStore**: 負責設定檔 (`config.json`) 的讀寫與序列化。
- **LedController**: 負責 LED 邏輯控制 (狀態燈/RGBW) 與設定檔 (`led.json`) 管理。
- **Utils**: 提供 Log、Time 等通用工具函式。
- **AppController**: 應用層邏輯控制器，整合 LedController 與其他應用邏輯。
- **EWC_Shared**: 共用標頭檔，集中管理 Include 與全域變數。

## 2. 檔案說明與關鍵類別

### 2.1 EWC_Template.ino (主程式)
- **功能**: 系統整合中心。
- **關鍵流程**:
    - `setup()`: 初始化 Serial -> FileSystem -> Config -> WebPush -> Portal -> MQTT。
    - `loop()`: 呼叫 `gBus.loop()`, `gWp.loop()`, `maybeFireDailyHeartbeat()`。
    - `onMqttCommand()`: 處理 MQTT 接收到的指令 (led, push, etc.)。
    - `handleSerial()`: 處理序列埠輸入指令。

### 2.2 MqttBus.h (MQTT 匯流排)
- **類別**: `ewc::MqttBus`
- **功能**: 簡化 MQTT 操作，提供穩定連線機制。
- **API**:
    - `begin(...)`: 綁定所有依賴元件 (Client, Config, TLS, FS)。
    - `loop()`: 自動處理重連 (Backoff) 與 `PubSubClient::loop()`。
    - `publishState()`, `publishEvent()`: 快速發送標準格式訊息。
    - `setCommandHandler(...)`: 註冊指令回呼。
    - `pause()`, `resume()`: 供 WebPush 暫停 MQTT 以釋放資源。

### 2.3 WifiPortal.h (配網入口)
- **類別**: `ewc::WifiPortal`
- **功能**: 管理 Wi-Fi 連線與 Captive Portal。
- **API**:
    - `ensureConnected(force)`: 檢查連線，失敗或強制時啟動 Portal。
    - `onEnter()`, `onExit()`: Portal 進出事件 (用於暫停/恢復 MQTT)。
    - **自定義參數**: 使用 `WiFiManagerParameter` 建立 MQTT/WebPush 設定欄位。
    - **Web OTA**: 內建 `/update` 路由與上傳介面。

### 2.4 WebPush.h (推播模組)
- **類別**: `ewc::WebPush`
- **功能**: 發送 Web Push 通知。
- **API**:
    - `enqueueMessage(title, body)`: 將訊息加入佇列。
    - `loop()`: 處理佇列發送 (使用 `WiFiClientSecure`)。
    - **注意**: 發送時會暫停 MQTT 以避免 SSL 記憶體不足 (特別是 ESP8266)。

### 2.5 TlsHelper.h (TLS 輔助)
- **類別**: `ewc::TlsHelper`
- **功能**: 設定 SSL Client 的 CA 憑證。
- **API**:
    - `configure(...)`: 從檔案系統讀取 CA (`/ca.pem`) 並載入至 Client。
    - 支援 ESP8266 (BearSSL) 與 ESP32 (mbedTLS) 的差異處理。

### 2.6 ConfigStore.h (設定存取)
- **類別**: `ewc::ConfigStore`, `ewc::AppConfig`
- **功能**: JSON 設定檔管理。
- **API**:
    - `load(...)`, `save(...)`: 讀寫 `/config.json`。
    - `AppConfig`: 定義所有設定欄位的結構體 (Struct)。

### 2.7 LedController.h (LED 控制)
- **類別**: `ewc::LedController`
- **功能**: 多路 LED 控制 (Blink, Breathe, Fade, Toggle)。
- **API**:
    - `attach(...)`: 指定腳位與模式。
    - `update()`: 週期性驅動動畫。
    - `processCommand()`: 解析並執行文字指令。
    - `loadFromFs()`, `saveToFs()`: 讀寫 `/led.json`。
    - `eraseConfig()`: 清除設定檔。

### 2.8 AppController.h (應用層控制)
- **類別**: `ewc::AppController`
- **功能**: 處理應用層邏輯，如 LED 狀態機。
- **API**:
    - `updateStatusLed(wifi, mqtt)`: 根據連線狀態更新 LED (Fast Blink / Slow Blink / Off)。
    - `processCommand()`: 轉發指令給 LedController。

### 2.9 Utils.h (工具庫)
- **功能**: Log 巨集與時間工具。
- **API**:
    - `LOG_INFO(...)`, `LOG_WARN(...)`: 統一格式的 Log 輸出。
    - `timeutil::syncTimeOnce(...)`: NTP 時間同步。
    - `currentTimestamp()`: 取得 ISO8601 時間字串。

### 2.10 EWC_Shared.h (共用定義)
- **功能**: 專案共用標頭檔。
- **內容**:
    - 集中管理所有 Library Include。
    - 宣告全域變數 (`extern`) 以供跨檔案存取。
    - 提供通用輔助函式 (OTA, Time, Print)。

## 3. 開發環境與依賴

### 3.1 硬體支援
- **ESP8266**: ESP-01M, NodeMCU (Core v3.1.2+)
- **ESP32**: ESP32-C3, ESP32-S3 (Core v3.0.0+)

### 3.2 程式庫依賴 (Library Dependencies)
請透過 Arduino Library Manager 安裝：
1.  **PubSubClient** (v2.8.0+)
2.  **WiFiManager** (v2.0.17+) - *by tzapu*
3.  **ArduinoJson** (v7.x)

### 3.3 編譯設定
- **Flash Size**: 建議至少 2MB (若需 OTA 或大量 Log)。
- **FS**: 建議使用 **LittleFS**。
- **ESP8266 SSL**: 需注意 Heap 大小，建議將 `MMU` 設定為 `16KB cache + 48KB IRAM` (若可用) 或標準設定。

## 4. 注意事項
1.  **記憶體管理**: ESP8266 在同時開啟 MQTT (SSL) 與 WebPush (SSL) 時極易 OOM (Out of Memory)。因此設計上採用 **互斥機制**：發送 WebPush 時會暫停 MQTT。
2.  **Blocking**: Portal 模式是 Blocking 的，期間無法處理其他工作。
3.  **憑證更新**: 若 `tlsVerify` 開啟，需確保 `/ca.pem` 有效且未過期。可透過 `MqttBus` 的機制或手動上傳更新。
