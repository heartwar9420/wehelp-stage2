// popup 

const selectorBtn = document.querySelector(".search-selector");
const popup = document.getElementById("categoryPopup");

function openPopup() {
  popup.classList.remove("is-hidden"); //把隱藏remove掉
}

function closePopup() {
  popup.classList.add("is-hidden"); //把隱藏add回來
}


selectorBtn.addEventListener("click", () => { //監測點擊
  const isHidden = popup.classList.contains("is-hidden"); //檢查popup的class中 有沒有包含 is-hidden 這個class
  if (isHidden) openPopup();
  else closePopup();
});

//如果點的不是選單或按鈕，就關掉選單
document.addEventListener("click", (e) => {
  //監測是否點到按鈕或選單
  const clickedButton = selectorBtn.contains(e.target);
  const clickedPopup = popup.contains(e.target);
  //如果是的話就結束
  if (clickedButton) return;
  if (clickedPopup) return;
  //如果不是的話就關掉選單
  closePopup();
});

// 如果按下 ESC 就關掉選單
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});



// fetch api/categories
async function api_categories() { //非同步函式，等待await api 回應
  const categoryMenu = document.getElementById("categoryPopup"); // 用 getelementbyid 抓到 對應的id 放到要顯示的變數中
  try { // 用 try / catch 把可能出錯的部分包起來
    const res = await fetch("/api/categories"); // 用 await fetch 抓 api/categories的api
    if (!res.ok) throw new Error(`連線失敗: ${res.status}`);
    
    const json = await res.json(); // 把抓到的資料轉成json格式
    const categories = Array.isArray(json.data) ? json.data : []; // 確保抓到的 categories 是 array 型式 如果不是array 就給一個空array

    categoryList = categories;

    const items = ["全部分類", ...categories]; 
    // 把 全部分類放到清單的最前面 ， ...categories = 展開語法會把後面的array展開
    // 會把他變成 ["全部分類","其他","單車遊踨".....]
    categoryMenu.innerHTML = ""; 

    const COLS = 4; // 限制在 4 欄

    const colElements = []; // 準備一個空籃子，用來btn

    for (let i = 0; i < COLS; i++) {
      const categoryCol = document.createElement("div"); // 建立 div
      categoryCol.className = "category-col"; // 建立 class name
      categoryMenu.appendChild(categoryCol); // 直接把這欄掛到網頁畫面上
      colElements.push(categoryCol); // 把這欄存進籃子裡，等一下要往裡面塞按鈕
    }

    items.forEach((name, i) => { // 把剛剛展開的 items array 用 forEach 的方式 一個一個做下面的動作
      const btn = document.createElement("button"); //加上一個button 的 標籤
      btn.type = "button"; // type = button
      btn.className = "category-list-med category-item btn"; // class name = "category-item"
      btn.textContent = name; // 把分類的名稱放到 <button> 中間 </button>

    btn.addEventListener("click", () => {
        const searchInput = document.querySelector(".search-bar");
        
        // 關鍵修正：如果是「全部分類」，關鍵字要設為空字串 ""，API 才會回傳所有景點
        const searchKeyword = (name === "全部分類") ? "" : name;
        
        searchInput.value = searchKeyword; // 搜尋框顯示
        currentKeyword = searchKeyword;    // 全域變數同步
        nextPage = 0;
        api_attractions(0, currentKeyword);
        closePopup();
    });

      colElements[i % COLS].appendChild(btn); // .appendChild(btn) = 把做好的btn 放到 div中間 用 i % COLS 來計算要放到哪一格
    });

  } catch (err) {
    console.error("渲染分類時出錯:", err);
    categoryMenu.innerHTML = `<p class="error">無法載入分類，請稍後再試</p>`;
  }
}

document.addEventListener("DOMContentLoaded", api_categories); // 當 dom 讀取完之後 ， 馬上跑這一段函式

// seartchBtn 

const searchBtn = document.querySelector(".search-btn");
searchBtn.addEventListener("click", () => {
    const searchInput = document.querySelector(".search-bar");
    currentKeyword = searchInput.value.trim();
    nextPage = 0;
    api_attractions(0, currentKeyword);
});


// mrtsbutton

const leftBtn = document.querySelector(".mrt-list-left-button");
const rightBtn = document.querySelector(".mrt-list-right-button");
const mrtList = document.getElementById("mrtslistMenu");

// 設定點擊一次要捲動的距離
const scrollAmount = 700;

// 向左捲動
leftBtn.addEventListener("click", () => {
  mrtList.scrollBy({ // scrollBy = 捲動
    left: -scrollAmount, // 負值代表向左
    behavior: "smooth"   // 平滑捲動效果
  });
});

// 向右捲動
rightBtn.addEventListener("click", () => {
  mrtList.scrollBy({
    left: scrollAmount,  // 正值代表向右
    behavior: "smooth"   // 平滑捲動效果
  });
});

// fetch /api/mrts

async function api_mrts() { //非同步函式，等待await api 回應
  const mrtsMenu = document.getElementById("mrtslistMenu"); // 用 getelementbyid 抓到 對應的id 
  try { // 用 try / catch 把可能出錯的部分包起來
    const res = await fetch("/api/mrts"); // 用 await fetch 抓 api/mrts 的api
    if (!res.ok) throw new Error(`連線失敗: ${res.status}`);
    
    const json = await res.json(); // 把抓到的資料轉成json格式
    const mrts = Array.isArray(json.data) ? json.data : []; // 確保抓到的 mrts 是 array 型式 如果不是array 就給一個空array

    mrtsMenu.innerHTML = ""; 
  
    mrts.forEach((name) => { // 把 array 用 forEach 的方式 一個一個做下面的動作
      const btn = document.createElement("button"); //加上一個button 的 標籤
      btn.type = "button"; // type = button
      btn.className = "mrtsbtn btn";
      btn.textContent = name; // 把分類的名稱放到 <button> 中間 </button>

      btn.addEventListener("click", () => {
        const searchInput = document.querySelector(".search-bar");
        searchInput.value = name; // 填入文字
        
        currentKeyword = name;    // 更新全域關鍵字
        nextPage = 0;             // 重設頁碼
        api_attractions(0, name); // 觸發搜尋
    });

      mrtsMenu.appendChild(btn) // .appendChild(btn) = 把做好的btn 放到 div中間
    });

  } catch (err) {
    console.error("渲染分類時出錯:", err);
    popup.innerHTML = `<p class="error">無法載入分類，請稍後再試</p>`;
  }
}

document.addEventListener("DOMContentLoaded", api_mrts);

// fetch /api/attractions

let nextPage = 0; // 初始頁碼為 0
let isLoading = false; // 追蹤是否正在抓取中
let currentKeyword = ""; // 紀錄當前搜尋的關鍵字
let categoryList = []; // 用來存放從 API 抓到的分類名稱

async function api_attractions(page,keyword = "") {
    if (page === null || isLoading) return;

    isLoading = true;
    
    const attractionList = document.querySelector(".attraction-list");

    try {
            let url = `/api/attractions?page=${page}`;

            if (keyword) {
                if (categoryList.includes(keyword)) {
                    url += `&category=${encodeURIComponent(keyword)}`;
                } else {
                    url += `&keyword=${encodeURIComponent(keyword)}`;
                }
            }

        const res = await fetch(url); 
        
        if (!res.ok) throw new Error("API 請求失敗");
        const json = await res.json();
        const data = json.data;
        nextPage = json.nextPage;

        // 如果 page = 0 清空舊內容
        if (page === 0) attractionList.innerHTML = "";

        // 檢查是否有資料
        if (!data || data.length === 0) {
            attractionList.innerHTML = `<p class="error">找不到與「${keyword}」相關的景點</p>`;
            return;
        }

        data.forEach(attraction => {
            const attraction_card = document.createElement("div");
            attraction_card.className = "attraction-card btn";

            const imageUrl = attraction.images[0];
            
            attraction_card.innerHTML = `
                <div class="attractions-image">
                    <img src="${imageUrl}">
                    <div class="attractions-image-name">${attraction.name}</div>
                </div>
                <div class="attractions-info">
                    <div class="attractions-mrt-name body-med">${attraction.mrt || ""}</div>
                    <div class="attractions-category-name body-med">${attraction.category}</div>
                </div>
            `;
            attractionList.appendChild(attraction_card);
        });

    } catch (err) {
        console.error("載入景點失敗:", err);
    } finally {
        isLoading = false; // 完成後開放下次抓取
    }
}

document.addEventListener("DOMContentLoaded", () => {
    api_attractions(nextPage);
});

// next page

const observer = new IntersectionObserver((entries) => { // IntersectionObserver 用來監測 是否到達頁底
    if (entries[0].isIntersecting && nextPage !== null && !isLoading) { //如果下一頁不是 null 而且 entries 出現在頁底了嗎？
        api_attractions(nextPage, currentKeyword); //跑一次函式
    }
}, { threshold: 0.1 }); //觸發門檻 0~1
 
const sentinel = document.getElementById("footer-sentinel");
observer.observe(sentinel); //監視器.監視(被監視者)