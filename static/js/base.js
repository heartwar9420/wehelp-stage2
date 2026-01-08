// login Dialog
const loginDialog = document.querySelector('#loginDialog'); // 抓 dialog
const loginErrortext = document.querySelector('.login__errortext');
const registerErrortext = document.querySelector('.register__errortext');
function openloginDialog() {
  loginDialog.showModal();
}
function closeloginDialog() {
  loginDialog.close();
  loginErrortext.classList.add('is-hidden');
}

const navBtnLogin = document.querySelector('.nav__btn--login');
navBtnLogin.addEventListener('click', () => {
  openloginDialog();
});

// register Dialog
const registerDialog = document.querySelector('#registerDialog');
function openregisterDialog() {
  registerDialog.showModal();
}
function closeregisterDialog() {
  registerDialog.close();
  registerErrortext.classList.add('is-hidden');
}

const loginRegisterBtn = document.querySelector('.login__register-btn');
loginRegisterBtn.addEventListener('click', () => {
  closeloginDialog();
  openregisterDialog();
});

const registerLoginBtn = document.querySelector('.register__login-btn');
registerLoginBtn.addEventListener('click', () => {
  closeregisterDialog();
  openloginDialog();
});

//RegistercloseBtn & LogincloseBtn
const RegistercloseBtn = document.querySelector('.login__close-btn');
RegistercloseBtn.addEventListener('click', () => {
  closeloginDialog();
});

const LogincloseBtn = document.querySelector('.register__close-btn');
LogincloseBtn.addEventListener('click', () => {
  closeregisterDialog();
});

// register
async function Register() {
  // 抓取資料
  const name = document.querySelector(".register__input[type='text']").value;
  const email = document.querySelector(".register__input[type='email']").value;
  const password = document.querySelector(".register__input[type='password']").value;

  if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
    registerErrortext.classList.remove('is-hidden'); //把隱藏remove掉
    registerErrortext.textContent = '名字或信箱或密碼不可以留白';
    return;
  }

  // 發送請求
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }), // 轉成 JSON 字串
  });

  const result = await response.json();

  if (result.ok) {
    alert('註冊成功，歡迎登入');
    closeregisterDialog();
    openloginDialog();
  } else {
    registerErrortext.classList.remove('is-hidden'); //把隱藏remove掉
    registerErrortext.textContent = result.message;
  }
}

const registerForm = document.querySelector('.register__input-area');
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    Register();
  });
}
// Login
async function Login() {
  // console.log('進入了 Login 函式');
  // 抓取資料
  const email = document.querySelector(".login__input[type='email']").value;
  const password = document.querySelector(".login__input[type='password']").value;

  // console.log('開始發送請求');
  // 發送請求
  const response = await fetch('/api/user/auth', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // 轉成 JSON 字串
  });
  // console.log('開始把response轉成json格式');
  const result = await response.json();
  // console.log('後端回傳的結果：', result);

  if (result.token) {
    localStorage.setItem('token', result.token); // 將後端回傳的驗證憑證（Token）儲存在瀏覽器，以維持登入狀態
    alert('登入成功！');
    const wanttoBooking = sessionStorage.getItem('wanttoBooking');
    if (wanttoBooking) {
      sessionStorage.removeItem('wanttoBooking');
      window.location.href = '/booking';
    } else {
      closeloginDialog();
      location.reload(); // 重新載入頁面
    }
  } else {
    loginErrortext.classList.remove('is-hidden'); //把隱藏remove掉
    loginErrortext.textContent = result.message;
  }
}

const loginForm = document.querySelector('.login__input-area');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    Login();
  });
}

//checkAuthStatus
async function checkAuthStatus() {
  let token = localStorage.getItem('token');
  if (!token) {
    return;
  } else {
    const response = await fetch('/api/user/auth', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
    });
    const result = await response.json();
    if (result.data) {
      const logoutBtn = document.querySelector('.nav__btn--logout');
      const loginBtn = document.querySelector('.nav__btn--login');
      logoutBtn.classList.remove('is-hidden');
      loginBtn.classList.add('is-hidden');
    } else {
      localStorage.removeItem('token');
    }
  }
}
document.addEventListener('DOMContentLoaded', checkAuthStatus); // 當 dom 讀取完之後 ， 馬上跑這一段函式

// logout
function logout() {
  localStorage.removeItem('token');
  alert('您已成功登出！');
  window.location.replace('/');
}

const logoutBtn = document.querySelector('.nav__btn--logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// booking

const bookingBtn = document.querySelector('.js-booking');
bookingBtn.addEventListener('click', function () {
  const token = localStorage.getItem('token');

  if (token) {
    window.location.href = '/booking';
  } else {
    sessionStorage.setItem('wanttoBooking', '/booking');
    openloginDialog();
  }
});
