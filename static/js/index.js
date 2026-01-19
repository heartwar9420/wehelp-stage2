// popup
const loading = document.querySelector('.loading');
loading.classList.remove('is-hidden');
const selectorBtn = document.querySelector('.search-selector');
const popup = document.getElementById('categoryPopup');

function openPopup() {
  popup.classList.remove('is-hidden'); //把隱藏remove掉
}

function closePopup() {
  popup.classList.add('is-hidden'); //把隱藏add回來
}

selectorBtn.addEventListener('click', () => {
  //監測點擊
  const isHidden = popup.classList.contains('is-hidden'); //檢查popup的class中 有沒有包含 is-hidden 這個class
  if (isHidden) openPopup(); // 如果目前是隱藏的，就執行開啟函式
  else closePopup(); //如果不是 就執行關閉函式
});

document.addEventListener('click', (e) => {
  // 監測整個網頁

  //contains 用來檢查目標物是不是包含在該元素內部
  const clickedButton = selectorBtn.contains(e.target); //檢查點擊的位置是否在按鈕中
  const clickedPopup = popup.contains(e.target); // 檢查點擊的位置是否在選單中
  //如果是的話就結束
  if (clickedButton) return;
  if (clickedPopup) return;
  //如果不是的話就關掉選單
  closePopup();
});

// 如果按下 ESC 就關掉選單
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});

let categoryList = []; // 用來存放從 API 抓到的分類名稱

// fetch api/categories
async function api_categories() {
  //非同步函式，等待await api 回應
  const category_btn = document.getElementById('category-btn');
  const categoryMenu = document.getElementById('categoryPopup'); // 用 getelementbyid 抓到 對應的id 放到要顯示的變數中
  try {
    // 用 try / catch 把可能出錯的部分包起來
    const res = await fetch('/api/categories'); // 用 await fetch 抓 api/categories的api
    // res.ok 會回傳 true or false , res.status 會 回傳 狀態碼 (200 400 404 500 等等)
    // throw 會強制結束 try 中的 code ,new Error 會生成一個新的 ERROR 物件  裡面可以用來放字串
    if (!res.ok) throw new Error(`連線失敗: ${res.status}`);

    const json = await res.json(); // 把抓到的資料轉成json格式

    let categories;

    if (Array.isArray(json.data)) {
      //檢查 json.data 是不是陣列
      categories = json.data; //如果是陣列，就把資料存進去
    } else {
      categories = []; //如果不是陣列（或是空的），就給它一個空籃子 []
    }

    categoryList = categories; // 把抓到的資料存到categoryList中，為了重複使用

    const items = ['全部分類', ...categories];
    // 把 全部分類放到清單的最前面 ， ...categories = 展開語法會把後面的array展開
    // 會把他變成 ["全部分類","其他","單車遊踨".....]
    categoryMenu.innerHTML = '';

    const COLS = 4; // 限制在 4 欄

    const colElements = []; // 準備一個空籃子，用來放 btn

    for (let i = 0; i < COLS; i++) {
      const categoryCol = document.createElement('div'); // 建立 div
      categoryCol.className = 'category-col'; // 建立 class name
      categoryMenu.appendChild(categoryCol); // 直接把這欄掛到網頁畫面上
      colElements.push(categoryCol); // 把這欄存進籃子裡，等一下要往裡面塞按鈕
    }
    //第一個參數 (category_name) 是陣列裡的每一筆資料 第二個參數 (i)：是這筆資料的號碼（0, 1, 2...）
    items.forEach((category_name, i) => {
      // 把剛剛展開的 items array 用 forEach 的方式 一個一個做下面的動作
      const popupBtn = document.createElement('button'); //加上一個button 的 標籤
      popupBtn.type = 'button'; // type = button
      popupBtn.className = 'category-list-med category-item btn'; // class name = "category-item"
      popupBtn.textContent = category_name; // 把分類的名稱放到 <button> 中間 </button> , 也就是修改中間的文字

      popupBtn.addEventListener('click', () => {
        const searchInput = document.querySelector('.search-bar');
        const popupname = category_name;

        if (popupname === '全部分類') {
          category_btn.textContent = popupname + ' ▼';
          currentCategory = '';
        } else {
          category_btn.textContent = popupname + ' ▼';
          currentCategory = popupname;
        }

        currentKeyword = searchInput.value.trim();

        nextPage = 0;
        api_attractions(0, currentKeyword, currentCategory);
        closePopup();
      });

      colElements[i % COLS].appendChild(popupBtn);
      // .appendChild(popupBtn) = 把做好的popupBtn 放到 div中間 也就是<div><button></button></div>
      // 用 i % COLS 來計算要放到哪一格
    });
  } catch (err) {
    console.error('渲染分類時出錯:', err);
    categoryMenu.innerHTML = `<p class="error">無法載入分類，請稍後再試</p>`;
  }
}

document.addEventListener('DOMContentLoaded', api_categories); // 當 dom 讀取完之後 ， 馬上跑這一段函式

// seartchBtn

const searchForm = document.getElementById('search-form');

searchForm.addEventListener('submit', (event) => {
  //submit 是為了讓使用者按下 enter 也可以有反應
  event.preventDefault(); //阻止表單預設的 重新整理 行為 , 為了實現 不用換頁的動態操作

  //  獲取輸入框的值
  const searchInput = document.querySelector('.search-bar');
  currentKeyword = searchInput.value.trim(); // trim = 把頭尾的空白清掉

  nextPage = 0; // 把頁數調回 0
  api_attractions(0, currentKeyword, currentCategory);
});

// mrtsbutton

const leftBtn = document.querySelector('.mrt-list-left-button');
const rightBtn = document.querySelector('.mrt-list-right-button');
const mrtList = document.getElementById('mrtslistMenu');

// 設定點擊一次要捲動的距離
const scrollAmount = 700;

// 向左捲動
leftBtn.addEventListener('click', () => {
  mrtList.scrollBy({
    // scrollBy = 捲動
    left: -scrollAmount, // 負值代表向左
    behavior: 'smooth', // 平滑捲動效果
  });
});

// 向右捲動
rightBtn.addEventListener('click', () => {
  mrtList.scrollBy({
    left: scrollAmount, // 正值代表向右
    behavior: 'smooth', // 平滑捲動效果
  });
});

// fetch /api/mrts

async function api_mrts() {
  //非同步函式，等待await api 回應
  const mrtsMenu = document.getElementById('mrtslistMenu'); // 用 getelementbyid 抓到 對應的id
  try {
    // 用 try / catch 把可能出錯的部分包起來
    const res = await fetch('/api/mrts'); // 用 await fetch 抓 api/mrts 的api
    if (!res.ok) throw new Error(`連線失敗: ${res.status}`);

    const json = await res.json(); // 把抓到的資料轉成json格式
    let mrts;

    if (Array.isArray(json.data)) {
      mrts = json.data;
    } else {
      mrts = [];
    }

    mrtsMenu.innerHTML = '';

    mrts.forEach((mrtsname) => {
      // 把 array 用 forEach 的方式 一個一個做下面的動作
      const mrtsbtn = document.createElement('button'); //加上一個button 的 標籤
      mrtsbtn.type = 'button'; // type = button
      mrtsbtn.className = 'mrtsbtn btn';
      mrtsbtn.textContent = mrtsname; // 把分類的名稱放到 <button> 中間 </button>

      mrtsbtn.addEventListener('click', () => {
        const searchInput = document.querySelector('.search-bar');
        searchInput.value = mrtsname; // 填入文字

        currentKeyword = mrtsname; // 更新全域關鍵字
        nextPage = 0; // 重設頁碼
        api_attractions(0, mrtsname, currentCategory, currentKeyword); // 觸發搜尋
      });

      mrtsMenu.appendChild(mrtsbtn); // .appendChild(mrtsname) = 把做好的btn 放到 div中間
    });
  } catch (err) {
    console.error('渲染分類時出錯:', err);
    popup.innerHTML = `<p class="error">無法載入分類，請稍後再試</p>`;
  }
}

document.addEventListener('DOMContentLoaded', api_mrts);

// fetch /api/attractions

let nextPage = 0; // 初始頁碼為 0
let isLoading = false; // 追蹤是否正在抓取中
let currentKeyword = ''; // 紀錄當前搜尋的關鍵字
let currentCategory = ''; // 紀錄當前搜尋的景點分類

async function api_attractions(page, keyword = '', category = '') {
  if (page === null || isLoading) return; //如果頁面是null 或是正在loading 就停止

  isLoading = true; //開始函式就 = 開始loading

  if (page === 0) {
    loading.classList.remove('is-hidden');
  }

  const attractionList = document.querySelector('.attraction-list');

  try {
    let url = `/api/attractions?page=${page}`;

    // encodeURIComponent = 用網頁的編碼方式來編寫中文，才不會出現錯誤
    if (keyword) {
      {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }
    }
    if (category) {
      {
        url += `&category=${encodeURIComponent(category)}`;
      }
    }

    const res = await fetch(url);

    if (!res.ok) throw new Error('API 請求失敗');
    const json = await res.json();
    const data = json.data;
    nextPage = json.nextPage;

    // 如果 page = 0 清空舊內容
    if (page === 0) attractionList.innerHTML = '';

    // 檢查是否有資料
    if (!data || data.length === 0) {
      let message = '找不到';

      // 建立搜尋條件的描述
      if (keyword && category) {
        message += `與地點「${keyword}」及分類「${category}」相關的景點`;
      } else if (keyword) {
        message += `與地點「${keyword}」相關的景點`;
      } else if (category) {
        message += `與分類「${category}」相關的景點`;
      } else {
        message += '任何景點';
      }

      attractionList.innerHTML = `<p class="error">${message}</p>`;
      return;
    }

    data.forEach((attraction) => {
      const attraction_card = document.createElement('div');
      attraction_card.className = 'attraction-card btn';

      const imageUrl = attraction.images[0];

      // 動態生成 html
      attraction_card.innerHTML = `
            <a href = "/attraction/${attraction.id}">
                <div class="attractions-image">
                    <img src="${imageUrl}">
                    <div class="attractions-image-name">${attraction.name}</div>
                </div>
            </a>
                <div class="attractions-info">
                    <div class="body-med attractions-mrt-name ">${attraction.mrt || ''}</div>
                    <div class="body-med attractions-category-name ">${attraction.category}</div>
                </div>
            `;
      attractionList.appendChild(attraction_card);
    });
  } catch (err) {
    console.error('載入景點失敗:', err);
  } finally {
    loading.classList.add('is-hidden');
    isLoading = false; // 完成後 = 結束讀取了！
  }
}

document.addEventListener('DOMContentLoaded', () => {
  api_attractions(nextPage);
});

// next page

const observer = new IntersectionObserver(
  (entries) => {
    // IntersectionObserver 用來監測 是否到達頁底
    if (entries[0].isIntersecting && nextPage !== null && !isLoading) {
      //如果下一頁不是 null 而且 entries 出現在頁底了嗎？
      api_attractions(nextPage, currentKeyword, currentCategory); //跑一次函式
    }
  },
  { threshold: 0.1 }
); //觸發門檻 0~1

const sentinel = document.getElementById('footer-sentinel');
observer.observe(sentinel); //監視器.監視(被監視者)
