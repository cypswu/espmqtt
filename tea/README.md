# 品茶 QR Code 管理系統

> Single‑page web application for creating & scanning tea product QR codes  
> Version **1.0.0** · MIT License

## 目錄
- [介紹](#介紹)
- [功能特色](#功能特色)
- [快速開始](#快速開始)
- [技術棧](#技術棧)

## 介紹
`index.html` 是一支完全自足的單頁應用（SPA），  
用來 **輸入 26 項茶葉資訊並產生可掃描的 QR Code**；  
同時也內建 **相機掃描器**，可立即驗證並將資料視覺化顯示。

<kbd>HTML + CSS + JavaScript</kbd>，無需後端即可離線執行。  

---

## 功能特色
| 類別 | 說明 |
|---|---|
| ✏️ 表單輸入 | 一次填寫 26 個欄位，另可選擇上傳產品圖片 (Base64)。|
| 📷 QR Code 產生 | 將 JSON → Base64 → QR，容量上限約 2.9 KB，自動檢測超限並提示。|
| 🔍 QR Code 掃描 | 內建 html5‑qrcode 掃描 UI，預設優先後鏡頭，掃描後以中文欄位顯示。|
| 🎨 視覺設計 | 客製茶葉色票、Playfair Display 字體、大圓角卡片、進場動畫。|
| 🛠️ 易於維護 | 欄位名稱、中文對照、主題色票皆集中管理，註解標示關鍵區塊。|

---

## 快速開始
1. 下載或複製本專案，確定路徑內含 `index.html`。  
2. **雙擊** `index.html` 在瀏覽器開啟（建議 Chrome/Edge）。  
   - 若需啟用相機掃描，瀏覽器必須透過 **HTTPS** 或 **localhost**。  
3. 在【產生 QR Code】分頁填寫表單並點選 **「產生 QR Code」**。  
4. 切至【掃描 QR Code】分頁，授權相機後對準剛生成的 QR。  
5. 資料將以 **中文名稱 + 值** 的清單呈現，並可預覽圖片。

---

## 技術棧
- **Bootstrap 5.3** — 佈局與元件  
- **QRious 4.0.2** — 於前端產生 QR Code  
- **html5‑qrcode 2.3.7** — 相機掃描與解碼  
- **Google Fonts** — Noto Serif TC、Playfair Display  
- **Vanilla JS / CSS 3** — 無依賴框架

---
