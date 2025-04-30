# 品茶 QR Code 管理系統

> Single-page web application for creating & scanning tea product QR codes  
> Version **1.4.0** · MIT License

---

## 目錄
- [介紹](#介紹)  
- [功能特色](#功能特色)  
- [快速開始](#快速開始)  
- [維護要點](#維護要點)  
- [技術棧](#技術棧)  

---

## 介紹
`index.html` 是一支完全自足的單頁應用（SPA），  
用來 **輸入 26 項茶葉資訊＋產品圖片網址或上傳檔案**，  
並產生可掃描的 QR Code；同時內建 **相機掃描器**，  
對準 QR Code 即可立即解碼並以中文清單＋圖片預覽方式顯示。

純前端實作：  
<kbd>HTML + CSS + JavaScript</kbd>，  
無需後端即可離線執行。

---

## 功能特色

| 類別            | 說明                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| ✏️ 表單輸入     | 一次填寫 **26 個欄位**（茶葉名稱、產區、等級⋯⋯等）＋支援 **產品圖片網址** 或 **檔案上傳**。         |
| 📷 QR Code 產生 | JSON → **LZ-String 壓縮 Base64** → QRious 生成，<br>自動檢測容量上限 **2 953 bytes**，超限自動 fallback。 |
| 💾 QR Code 儲存 | 支援 **File System Access API**，<br>檔案對話框直存；不支援時自動回退傳統下載。                   |
| 🔄 QR Code 載入 | 檔案選擇器解析 QR 圖片，<br>先嘗試 `decompressFromBase64()`，失敗再 `atob()`，並回填表單。           |
| 🔍 QR Code 掃描 | 使用 **html5-qrcode**，優先後鏡頭，<br>可設定固定 `qrbox` 大小、記憶上次相機，<br>掃描後中文列表顯示＋圖片預覽。 |
| 🎨 視覺設計     | 客製茶葉色票、有襯線字體、圓角卡片、進場動畫，<br>Debug 區可收合。                               |
| 🛠️ 易於維護    | 欄位清單、中文對照、主題色票集中管理，<br>註解標示核心邏輯，format／分段易於閱讀與擴充。         |

---

## 快速開始
1. 下載或複製本專案，確認路徑內含 `index.html`。  
2. **雙擊** 或以 HTTP(S)/localhost 開啟 `index.html`（建議 Chrome/Edge，HTTP(S) 才能啟用相機）。  
3. 切至 **「產生 QR Code」** 分頁，**填寫 26 項欄位** 並點選 **「產生 QR Code」**。  
4. 如需儲存，點擊 **「儲存 QR Code」**；如需載入本地 QR 圖片，點擊 **「載入 QR Code」**。  
5. 切至 **「掃描 QR Code」** 分頁，授權相機後對準 QR，即可即時解碼並顯示資料。

---

## 維護要點
- **新增/刪減欄位時**：同步更新 HTML `<form>`、JS `fields[]`、`labelMap{}`。  
- **壓縮/解壓邏輯**：集中在 `submit` 與 `load-btn` 事件處理，調整時留意 fallback 順序。  
- **File System Access**：若需支援其他檔案類型，擴充 `showSaveFilePicker(…types…)` 設定。  
- **QRious 參數**：如需調整尺寸或容錯等級 (`level`)，請同步更新初始化參數。  

---

## 技術棧
- **Bootstrap 5.3** — 響應式佈局與元件  
- **QRious 4.0.2** — 前端 QR Code 生成  
- **html5-qrcode 2.3.7** — 相機掃描與解碼  
- **LZ-String 1.4.4** — JSON 壓縮/解壓  
- **Google Fonts** — Noto Serif TC、Playfair Display  
- **Vanilla JS / CSS 3** — 無其他框架依賴  

---

> _歡迎提交 Issue 或 Pull Request，一起優化此專案！_
