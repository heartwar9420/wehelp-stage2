# 台北一日遊電商網站 (Taipei Day Trip)

一個全端開發的旅遊電商平台，整合會員系統、景點搜尋、購物車與第三方金流支付功能。
本專案為 WeHelp Bootcamp Stage 2 的實作成果，重點在於**後端 API 架構設計**、**資料庫規劃**與**雲端部署**。

**網址**： ( AWS 網址)
**測試帳號**： `aa@aa.com`
**測試密碼**： `aa`

---

##  技術堆疊 (Tech Stack)

這是一個不依賴大型框架魔法，從底層邏輯建構的專案：

* **Backend**: Python, FastAPI
* **Database**: MySQL (使用 Raw SQL 指令操作，以深入理解資料庫邏輯)
* **Frontend**: JavaScript (Vanilla), Fetch API, HTML/CSS
* **Infrastructure**: AWS EC2 (Linux Ubuntu), Nginx
* **Payment**: TapPay SDK

---

##  系統架構設計 (System Architecture)

### 1. MVC 架構實踐
本專案採用 **MVC (Model-View-Controller)** 模式進行開發，雖然在學習階段為了掌握 SQL 邏輯，部分資料庫操作保留在邏輯層中，但整體職責劃分如下：
* **Model**: 定義資料庫結構與 SQL 查詢邏輯。
* **View (Templates/Static)**: 負責前端畫面渲染與使用者交互。
* **Controller (API Routes)**: 處理 FastAPI 的路由請求、驗證輸入資料、調用邏輯並回傳 JSON。

### 2. 資料庫設計與正規化 (Database Design)
資料庫共有 5 張 Tables。在設計景點資料時，我做出了一個關鍵的架構決策：

** 技術亮點：資料表正規化 (Normalization)**
* **挑戰**：一個景點 (`Attractions`) 通常包含多張圖片。
* **決策**：我不將圖片 URL 以逗號分隔字串塞在 `Attractions` 表中，而是建立獨立的 `Images` 表。
* **優點**：
    1.  符合資料庫正規化原則 (1-to-N Relationship)。
    2.  當需要查詢景點列表時，不會因為讀取大量圖片字串而拖慢 Query 速度。
    3.  未來擴充圖片數量時，不需要修改 Table 結構。

**ER Diagram 簡易說明：**
* `Member` (會員資料)
* `Attractions` (景點資訊 - ID, Name, Description...)
* `Images` (圖片儲存 - Image_URL, Attraction_ID FK)
* `Booking` (購物車/未結帳訂單)
* `Orders` (歷史訂單/已付款紀錄)

---

##  核心功能 (Core Features)

### 1. 會員驗證系統 (Authentication)
* 實作 JWT (JSON Web Token) 機制，維持使用者的登入狀態。
* 前端透過 Fetch API 發送帶有 Token 的請求，後端驗證身分後才允許存取購物車與訂單。

### 2. 景點搜尋 API (Search & Pagination)
* 支援「關鍵字搜尋」與「分頁功能 (Pagination)」。
* 優化 SQL 查詢效能，確保在大量景點資料中能快速回傳結果。

### 3. 預約與購物車邏輯 (Booking System)
* 設計 `Booking` 資料表作為暫存區。
* 當使用者下單但未付款時，資料存於 `Booking`；付款成功後，透過 Transaction (交易) 機制將資料轉移至 `Orders` 並清空購物車，確保資料一致性。

### 4. 金流串接 (Payment Integration)
* 串接 **TapPay** 第三方支付。
* 前端利用 TapPay iframe 取得 Prime Key，後端向 TapPay 伺服器請求扣款，完成完整的支付流程。

### 5. 會員中心 (Member Center)
建立完整的會員管理後台，實現 CRUD 中的 Update 與 Read 操作：
* **個人資料管理 (Profile Management)**：允許會員修改姓名、Email 等基本資料，透過 SQL `UPDATE` 指令即時更新資料庫。
* **大頭貼上傳 (Avatar Upload)**：
    * 實作圖片上傳功能（File Upload），限制檔案格式與大小。
    * 後端接收 `multipart/form-data` 請求，將圖片儲存後，更新 Member Table 中的圖片路徑欄位。
* **歷史訂單查詢 (Order History)**：
    * 透過 Member ID 查詢 `Orders` 資料表（One-to-Many Relationship）。
    * 使用者可隨時檢視過往的預約紀錄與付款狀態，提升使用者體驗。

---

##  專案心得與成長

在這個專案中，我最大的收穫是**「親手打造資料流的每一個環節」**。
從設計 MySQL Table 開始，到撰寫 Python SQL 指令，再到前端 fetch 資料渲染。雖然直接寫 Raw SQL 比起用 ORM 辛苦，但這讓我清楚看見了每一筆資料是如何在伺服器與資料庫之間流動，也為未來的後端優化打下基礎。
