// fetch /api/order/{orderNumber}
// 先取得 orderNumber
const loading = document.querySelector('.loading');
loading.classList.remove('is-hidden');
const urlPart = window.location.search; // 網址上面 ? 後面的那一串
const urlNumber = new URLSearchParams(urlPart); // 使用 URLSearchParams 來解析 url
const orderNumber = urlNumber.get('number'); //得到 "number=" 值
const url = `/api/order/${orderNumber}`; //把orderNumber 放到正確的位置中
const js_top_title = document.querySelector('.js-topTitle');
const js_sub_title = document.querySelector('.js-subTitle');
const js_order_number = document.querySelector('.js-orderNumber');
const js_text = document.querySelector('.js-text');
async function fetch_api_order() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    console.log(result.data);
    if (result.data) {
      if (result.data.status === 1) {
        js_top_title.textContent = '行程預定成功';
        js_sub_title.textContent = '您的訂單編號如下';
        js_order_number.textContent = result.data.number;
        js_text.textContent = '請記住此編號，或到會員中心查詢歷史訂單';
      } else {
        js_top_title.textContent = '行程預定失敗';
        js_top_title.style.color = 'red';
        js_sub_title.textContent = '請確認輸入資料是否正確';
        js_sub_title.style.color = 'red';
      }
    } else {
      js_top_title.textContent = '查無此筆訂單';
      js_sub_title.textContent = '請不要變更網址內容';
    }
  } catch (err) {
    console.error('讀取訂單失敗', err);
    js_top_title.textContent = '讀取失敗';
    js_sub_title.textContent = '請檢查網路連線';
  } finally {
    loading.classList.add('is-hidden');
  }
}

document.addEventListener('DOMContentLoaded', fetch_api_order);
