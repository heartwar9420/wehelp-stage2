// fetch get /api/booking
let bookingData = null;
let bookingAttraction = null;

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
    bookingData = result.data;
    bookingAttraction = bookingData.attraction;

    const attraction__title = document.querySelector('.attraction__title');
    attraction__title.textContent = bookingAttraction.name;

    const js_date = document.querySelector('.js-date');
    js_date.textContent = bookingData.date;

    const js_time = document.querySelector('.js-time');
    if (bookingData.time === 'morning') {
      js_time.textContent = '早上 9 點到下午 4 點';
    } else {
      js_time.textContent = '下午 2 點到晚上 9 點';
    }

    const js_base_price = document.querySelector('.js-base-price');
    js_base_price.textContent = bookingData.price;
    const js_total_price = document.querySelector('.js-total-price');
    js_total_price.textContent = bookingData.price;

    const attraction__img = document.querySelector('.attraction__img');
    attraction__img.src = bookingAttraction.image;

    const js_location = document.querySelector('.js-location');
    js_location.textContent = bookingAttraction.address;
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

// TapPay
TPDirect.setupSDK(
  166451,
  'app_JvUS9zTWPgzanCnhfHJZj187vHIROpPGJAy3AqaGNGC7bcNmWrk7V2e5FS7j',
  'sandbox'
);
TPDirect.card.setup({
  // Display ccv field
  fields: {
    number: {
      // css selector
      element: '#card-number',
      placeholder: '**** **** **** ****',
    },
    expirationDate: {
      // DOM object
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY',
    },
    ccv: {
      element: '#card-ccv',
      placeholder: 'ccv',
    },
  },

  styles: {
    // Style all elements
    input: {
      color: 'gray',
    },
    // Styling ccv field
    'input.ccv': {
      // 'font-size': '16px'
    },
    // Styling expiration-date field
    'input.expiration-date': {
      // 'font-size': '16px'
    },
    // Styling card-number field
    'input.card-number': {
      // 'font-size': '16px'
    },
    // style focus state
    ':focus': {
      // color: 'black',
    },
    // style valid state
    '.valid': {
      color: 'green',
    },
    // style invalid state
    '.invalid': {
      color: 'red',
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
      input: {
        color: 'orange',
      },
    },
  },
  // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
  isMaskCreditCardNumber: true,
  maskCreditCardNumberRange: {
    beginIndex: 6,
    endIndex: 11,
  },
});

// confirm
const checkoutForm = document.querySelector('.checkout__form');
checkoutForm.addEventListener('submit', function (event) {
  event.preventDefault(); // 暫停重整的動作
  TPDirect.card.getPrime(function (result) {
    // console.log(result);
    if (result.status !== 0) {
      alert('刷卡失敗，請確認輸入資料正確');
      return;
    }
    let prime = result.card.prime;
    post_api_order(prime);
  });
});

// fetch POST /api/order
async function post_api_order(prime) {
  const token = localStorage.getItem('token');
  const contactName = document.querySelector('.js-name').value;
  const contactEmail = document.querySelector('.js-email').value;
  const contactPhone = document.querySelector('.js-tel').value;

  const data = {
    prime: prime,
    order: {
      price: bookingData.price,
      trip: {
        attraction: {
          id: bookingAttraction.id,
          name: bookingAttraction.name,
          address: bookingAttraction.address,
          image: bookingAttraction.image,
        },
        date: bookingData.date,
        time: bookingData.time,
      },
      contact: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
      },
    },
  };
  // console.log(data);
  const res = await fetch('api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // 告訴後端我們傳的是 JSON，不然 FastAPI 會看不懂
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data), //把物件轉成JSON 字串
  });
  const result = await res.json();
  // console.log(result.data.number);
  window.location.href = `/thankyou?number=${result.data.number}`;
}
