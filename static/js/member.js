const logoutBtn = document.querySelector('.js-logout');

// logout
function logout() {
  localStorage.removeItem('token');
  alert('您已成功登出！');
  window.location.replace('/');
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
