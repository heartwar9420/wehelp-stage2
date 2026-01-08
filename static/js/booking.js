// fetch get /api/booking
async function get_api_booking() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }
  const res = await fetch('/api/booking', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  console.log(result);
  const booking__empty = document.querySelector('.booking__empty');
  const booking__content = document.querySelector('.booking__content');
  const userResponse = await fetch('/api/user/auth', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const userResult = await userResponse.json();
  const userData = userResult.data;
  if (userData) {
    // console.log(userData);
    const userAccountname = document.querySelector('.user_accountname');
    userAccountname.textContent = userData.name;
    const userName = document.querySelector('.js-name');
    userName.value = userData.name;
    const userEmail = document.querySelector('.js-email');
    userEmail.value = userData.email;
  }
  if (result.data === null) {
    booking__content.classList.add('is-hidden');
    booking__empty.classList.remove('is-hidden');
    return;
  } else {
    const data = result.data;
    const attraction = data.attraction;
    const attraction__title = document.querySelector('.attraction__title');
    attraction__title.textContent = data.attraction.name;

    const js_date = document.querySelector('.js-date');
    js_date.textContent = data.date;

    const js_time = document.querySelector('.js-time');
    if (data.time === 'morning') {
      js_time.textContent = '早上 9 點到下午 4 點';
    } else {
      js_time.textContent = '下午 2 點到晚上 9 點';
    }

    const js_base_price = document.querySelector('.js-base-price');
    js_base_price.textContent = data.price;
    const js_total_price = document.querySelector('.js-total-price');
    js_total_price.textContent = data.price;

    const attraction__img = document.querySelector('.attraction__img');
    attraction__img.src = attraction.image;

    const js_location = document.querySelector('.js-location');
    js_location.textContent = attraction.address;
  }
}
document.addEventListener('DOMContentLoaded', get_api_booking);

//fetch delete/api/booking
async function delete_api_booking() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }
  const res = await fetch('/api/booking', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  location.reload();
}
const deleteBtn = document.querySelector('.icon__delete');
deleteBtn.addEventListener('click', () => {
  delete_api_booking();
});
