// login Dialog
const loginDialog = document.querySelector('#loginDialog'); // 抓 dialog
function openloginDialog() {
  loginDialog.showModal();
}
function closeloginDialog() {
  loginDialog.close();
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
