
# 品茶 QR Code 管理系統 (Tea QR Manager)

> Single‑page web app for creating, compressing, linking & scanning tea‑product QR codes  
> **Version 1.6.4 · 2025‑05‑02 · MIT License**

---

## 目錄
- [介紹](#介紹)  
- [功能特色](#功能特色)  
- [快速開始](#快速開始)  
- [維護要點](#維護要點)  
- [技術棧](#技術棧)  
- [瀏覽器支援](#瀏覽器支援)  
- [授權](#授權)  

---

## 介紹
`index.html` 為**單檔**自足 SPA，  
提供 **「產生｜掃描｜使用說明」**三分頁介面，可：

1. **輸入／載入** 40+ 項茶葉欄位 + 商品圖片（網址或上傳）。  
2. **LZ‑String 壓縮 → Base64 → QRious** 產生 QR Code。  
3. **掃描 QR / 圖檔 / JSON** 立即還原並回填表單。  
4. **File System Access API** 或 `<a download>` 雙機制下載 PNG。  
5. **雲端 JSON 模式**：資料超過 QR 容量時，自動轉為連結模式。

純前端實作（HTML + CSS + Vanilla JS），可離線執行。

---

## 功能特色

| 分類 | 說明 |
| ---- | ---- |
| ✏️ 表單輸入 | 40+ 欄位分為 **基本 / 常用 / 進階 / 專家** 四大段落，支援圖片上傳預覽。 |
| 📦 壓縮演算法 | JSON → `LZString.compressToUint8Array()` → Base64；再以 QRious 產生 **Version 40‑M** QR (≈ 2 953 bytes)。 |
| ☁️ 雲端模式 | 壓縮後仍超額時，介面提示並顯示 *原始 JSON*，引導上傳 Gist / Pastebin，再以「Raw URL」產生 **連結 QR**。 |
| 💾 QR 儲存 | **File System Access API**優先；不支援時自動回退為 `<a download>` 下載 PNG。 |
| 🔄 QR 載入 | 支援載入 **QR 圖檔** 或 **JSON 檔**（原始 / 壓縮 `{v,d}` 格式）。 |
| 📷 即時掃描 | **html5‑qrcode 2.3.8** 支援多裝置相機，掃描後以中文清單＋圖片預覽呈現。 |
| 🛡️ 隱私安全 | 所有壓縮、解壓、掃描、下載均在瀏覽器本地執行；無後端 API。 |
| 🎨 視覺規劃 | Bootstrap 5.3.3 + Noto Serif TC / Playfair Display，茶綠配色、圓角卡片、Tooltip/Validation UX。 |

---

## 快速開始
1. 下載或複製本專案，直接開啟 `index.html`（建議 Chrome / Edge）。  
2. **產生 QR Code**  
   - 填寫表單 → 點 **「產生 QR」**  
   - 若顯示「資料量過大」視窗，依指示將 JSON 上傳雲端並貼回 URL。  
3. **儲存**：按 **「儲存 QR Code」**　(PNG)。  
4. **掃描**：切至「掃描 QR Code」分頁並允許相機權限。  
5. **載入**：使用「載入 QR Code」(圖檔) 或「載入 JSON」匯入既有資料。

> 離線使用：將 `index.html` 存至本機並開啟即可；唯相機功能需 HTTPS/localhost。

---

## 維護要點
| 區塊 | 注意事項 |
| ---- | -------- |
| `fieldConfig[]` | 新增 / 刪除欄位須同步 `id`、`label`、`section`、`col`。 |
| 壓縮 / 解壓 | 集中於 `handleFormSubmit()`、`restoreFromQrOrJson()`；調整順序時需維持 `fallback → decompress → parse` 流程。 |
| File System API | 如需擴充其他 MIME，修改 `showSaveFilePicker({types})`。 |
| QR 儲存尺寸 | 修改 `QRious({ size, level, padding })` 同步調整 `<canvas>` 寬高。 |
| Changelog | 置於 `index.html` 檔頭註解，發行時記得遞增版本。 |

---

## 技術棧
- **Bootstrap 5.3.3** — 響應式 UI 元件  
- **Bootstrap Icons 1.11** — 向量圖示  
- **QRious 4.0.2** — 前端 QR 生成  
- **html5‑qrcode 2.3.8** — 相機掃描  
- **LZ‑String 1.4.4** — JSON 壓縮/解壓  
- **Google Fonts** — Noto Serif TC, Playfair Display  
- **Vanilla JS / CSS 3**

---

## 瀏覽器支援
- **Chrome / Edge 96+** — 完整支援 File System Access API  
- **Firefox 95+** — 自動回退為 `<a download>` 下載  
- **iOS / Android** 主流瀏覽器均可掃描、載入 JSON

---

## 授權
Released under the **MIT License** — feel free to fork & improve!

---

> 最後更新：2025‑05‑04
