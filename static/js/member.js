const loading = document.querySelector('.loading');
const logoutBtn = document.querySelector('.js-logout');

loading.classList.remove('is-hidden');
// logout
function logout() {
  localStorage.removeItem('token');
  alert('您已成功登出！');
  window.location.replace('/');
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

const profileBtn = document.querySelector('.js-profileBtn');
const historyBtn = document.querySelector('.js-historyBtn');
const profileForm = document.querySelector('.js-profileForm');
const orderHistory = document.querySelector('.js-orderHistory');

profileBtn.addEventListener('click', () => {
  profileForm.classList.remove('is-hidden');
  orderHistory.classList.add('is-hidden');
});
historyBtn.addEventListener('click', () => {
  profileForm.classList.add('is-hidden');
  orderHistory.classList.remove('is-hidden');
});

// fetch /api/user/auth
async function get_api_user_auth() {
  loading.classList.remove('is-hidden');
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }
  try {
    const res = await fetch('/api/user/auth', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    const user_data = result.data;
    // console.log(user_data);
    if (result.data) {
      const js_userName = document.querySelector('.js-userName');
      const js_userEmail = document.querySelector('.js-userEmail');
      const js_userHeadshot = document.querySelector('.js-userHeadshot');
      js_userEmail.value = user_data.email;
      js_userName.value = user_data.name;
      if (user_data.avatar) {
        js_userHeadshot.src = `/static/uploads/${result.data.avatar}`;
      }
    }
  } catch (err) {
    console.error('載入失敗', err);
  }
}

// fetch /api/orders
async function get_api_orders() {
  loading.classList.remove('is-hidden');
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/';
    return;
  }
  try {
    const res = await fetch('api/orders', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    // console.log(result);
    // order = 全部的資料
    const orders = result.data;

    const orderContainer = document.querySelector('.js-orderHistory');
    // 先把資料清空
    orderContainer.innerHTML = '';
    orders.forEach((order) => {
      const cardHTML = `<div class="order_card">
              <div class="attraction__imgarea">
                <img src="${order.trip.attraction.image}" class="attraction__img" />
              </div>
              <div class="attraction__info">
                <p class="attraction__content body-bold">
                  台北一日遊：<span class="attraction__title body-bold">${
                    order.trip.attraction.name
                  }</span>
                </p>
                <div class="attraction__item">
                  <span class="attraction__label body-bold">訂單編號：</span>
                  <span class="attraction__text body-med">${order.number}</span>
                </div>
                <div class="attraction__item">
                  <span class="attraction__label body-bold">日期：</span>
                  <span class="attraction__text js-date body-med">${order.trip.date}</span>
                </div>
                <div class="attraction__item">
                  <span class="attraction__label body-bold">時間：</span>
                  <span class="attraction__text js-time body-med">${
                    order.trip.time === 'morning' ? '早上 9 點到下午 4 點' : '下午 2 點到晚上 9 點'
                  }</span>
                </div>
                <div class="attraction__item">
                  <span class="attraction__label body-bold">費用：</span>
                  <span class="attraction__text body-med"
                    >新台幣<span class="js-base-price">${order.price}</span>元</span
                  >
                </div>
                <div class="attraction__item">
                  <span class="attraction__label body-bold">地點：</span>
                  <span class="attraction__text js-location body-med">${
                    order.trip.attraction.address
                  }</span>
                </div>
              </div>
            </div>`;
      orderContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
  } catch (err) {
    console.error('載入失敗', err);
  }
}

async function init() {
  loading.classList.remove('is-hidden');

  try {
    await Promise.all([get_api_orders(), get_api_user_auth()]);
  } catch (err) {
    console.error('錯誤', err);
  } finally {
    loading.classList.add('is-hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);

// upload headshot
const headshotBtn = document.querySelector('.headshot_btn');
const uploadInput = document.querySelector('#upload_input');
const userHeadshotImg = document.querySelector('.js-userHeadshot');

if (headshotBtn && uploadInput) {
  headshotBtn.addEventListener('click', () => {
    uploadInput.click();
  });
}

if (uploadInput) {
  uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0]; // 拿到使用者的第一個檔案
    if (!file) return; // 如果使用者取消就return
    if (file.size > 2 * 1024 * 1024) {
      alert('檔案過大，請選擇 2MB 以下的圖片');
      return;
    }

    // 無法使用 JSON 傳檔案 所以使用 FormData
    const formData = new FormData();
    formData.append('file', file); // file 對應 API 中的參數名稱

    const token = localStorage.getItem('token');
    loading.classList.remove('is-hidden');

    try {
      const res = await fetch('/api/user/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      console.log('上傳結果:', result);
      if (result.ok) {
        userHeadshotImg.src = `/static/uploads/${result.filename}`;
        alert('大頭貼更新成功');
      } else {
        alert(result.message || '上傳失敗，請梢後再試');
      }
    } catch (err) {
      console.error('上傳錯誤:', err);
      alert('系統錯誤,請稍後再試');
    } finally {
      loading.classList.add('is-hidden');
    }
  });
}
