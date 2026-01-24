// fetch /attraction/{id}
// 先取得 景點的 id
const loading = document.querySelector('.loading');
loading.classList.remove('is-hidden');

const dateInput = document.querySelector('.booking__fielddate');

const todayStr = new Date().toISOString().split('T')[0];
// 取得「今天」的標準日期格式 (YYYY-MM-DD)
// new Date() = 現在時間
// .toISOString() = 轉成國際標準字串 ("2026-01-19T06:00:00.000Z")
// .split('T')[0] = 從 "T" 切開，只拿前面日期的部分 ("2026-01-19")

dateInput.setAttribute('min', todayStr);
//設定 input 的最小值 (min) 屬性
//日曆打開時，比 todayStr 更早的日期都會變灰色，無法點選

const path = window.location.pathname; // 取得路徑部分，這會得到 "/attraction/1"
const parts = path.split('/'); // 使用 "/" 來切割字串
const attractionId = parts[parts.length - 1]; // 取得陣列中的最後一個元素
async function fetch_attraction_data() {
  const url = `/api/attraction/${attractionId}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('抓不到景點資料');

    const json = await res.json();
    const data = json.data;

    const attractionImage = document.querySelector('.attraction__image');
    let imageCount = 0;

    const attractionIndicatorBar = document.querySelector('.attraction__indicator-bar');

    function updateGallery() {
      const allIndicator = document.querySelectorAll('.attraction__indicator');
      allIndicator.forEach((Indicator) => {
        Indicator.classList.remove('active');
      });

      allIndicator[imageCount].classList.add('active');

      attractionImage.src = data.images[imageCount];
    }

    data.images.forEach((image, index) => {
      const attractionIndicator = document.createElement('span');

      attractionIndicator.className = 'attraction__indicator';
      if (index === 0) {
        attractionIndicator.classList.add('active');
      }

      attractionIndicatorBar.appendChild(attractionIndicator);
    });

    const attractionNavBtnLeft = document.querySelector('.attraction__nav-btn--left');
    const attractionNavBtnRight = document.querySelector('.attraction__nav-btn--right');

    attractionNavBtnLeft.addEventListener('click', () => {
      if (imageCount < data.images.length) {
        if (imageCount === 0) {
          imageCount = data.images.length;
        }
        imageCount = (imageCount - 1) % data.images.length;
        updateGallery();
      } else {
        return;
      }
    });

    attractionNavBtnRight.addEventListener('click', () => {
      if (imageCount < data.images.length) {
        imageCount = (imageCount + 1) % data.images.length;
        updateGallery();
      } else {
        return;
      }
    });
    updateGallery();
    const attractionTitle = document.querySelector('.attraction__title');
    attractionTitle.textContent = data.name;
    const attractionSubtitle = document.querySelector('.attraction__subtitle');
    attractionSubtitle.textContent = data.category + ' at ' + data.mrt;
    const infoContent = document.querySelector('.info__content');
    infoContent.textContent = data.description;
    const infoLocation = document.querySelector('.info__location');
    infoLocation.textContent = data.address;
    const infoTransport = document.querySelector('.info__transport');
    infoTransport.textContent = data.transport;
  } catch (err) {
    console.error('發生錯誤：', err);
  } finally {
    loading.classList.add('is-hidden');
  }
}

const radioInputs = document.querySelectorAll('input[name="time"]');
const bookingPrice = document.querySelector('.booking__price');

radioInputs.forEach((input) => {
  input.addEventListener('change', () => {
    // change = 被勾選了
    if (input.value === 'morning') {
      bookingPrice.textContent = '2000';
    } else {
      bookingPrice.textContent = '2500';
    }
  });
});

fetch_attraction_data();

// fetch /api/booking
const booking_btn = document.querySelector('#bookingBtn');
booking_btn.addEventListener('click', async function () {
  const selectDate = document.querySelector('.booking__fielddate').value;
  if (selectDate === '') {
    alert('請選擇日期！');
    return;
  }

  const timeInput = document.querySelector('input[name="time"]:checked');
  if (!timeInput) {
    alert('請選擇時間！');
    return;
  }
  const time = timeInput.value;
  let price = 0;
  if (time === 'morning') {
    price = 2000;
  } else {
    price = 2500;
  }

  const bookingData = {
    attractionId: parseInt(attractionId),
    date: selectDate,
    time: time,
    price: price,
  };
  const token = localStorage.getItem('token');
  if (!token) {
    sessionStorage.setItem('pickdate', selectDate);
    sessionStorage.setItem('picktime', time);
    openloginDialog();
    return;
  }
  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error(`預訂失敗`);
    const result = await res.json();
    console.log('預訂成功', result);
    window.location.href = '/booking';
  } catch (err) {
    console.error(err);
    alert('預訂失敗，請稍後再試');
  }
});
const picktime = sessionStorage.getItem('picktime');
const pickdate = sessionStorage.getItem('pickdate');

if (pickdate) {
  sessionStorage.removeItem('pickdate');
  const pickdatevalue = document.querySelector('.booking__fielddate');
  pickdatevalue.value = pickdate;
}

if (picktime) {
  sessionStorage.removeItem('picktime');
  const picktimevalue = document.querySelector(`input[name="time"][value="${picktime}"]`);
  picktimevalue.checked = true;
}
