// fetch /api/order/{orderNumber}
// 先取得 orderNumber
const urlPart = window.location.search; // 網址上面 ? 後面的那一串
const urlNumber = new URLSearchParams(urlPart); // 使用 URLSearchParams 來解析 url
const orderNumber = urlNumber.get('number'); //得到 "number=" 值

async function fetch_api_order() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }
  const url = `/api/order/${orderNumber}`; //把orderNumber 放到正確的地址中
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(res);
  const js_order = document.querySelector('.js-order');
  js_order.textContent = orderNumber;
}

document.addEventListener('DOMContentLoaded', fetch_api_order);
