// fetch /attraction/{id}

async function fetch_attraction_data() {
  // 先取得 景點的 id
  const path = window.location.pathname; // 取得路徑部分，這會得到 "/attraction/1"
  const parts = path.split('/'); // 使用 "/" 來切割字串
  const attractionId = parts[parts.length - 1]; // 取得陣列中的最後一個元素

  const url = `/api/attraction/${attractionId}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('抓不到景點資料');

    const json = await res.json();
    const data = json.data;

    const attractionImage = document.querySelector('.attraction__image');
    let imageCount = 0;

    const attractionIndicatorBar = document.querySelector(
      '.attraction__indicator-bar'
    );

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

    const attractionNavBtnLeft = document.querySelector(
      '.attraction__nav-btn--left'
    );
    const attractionNavBtnRight = document.querySelector(
      '.attraction__nav-btn--right'
    );

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
  }
}

const radioInputs = document.querySelectorAll('input[name="time"]');
const bookingPrice = document.querySelector('.booking__price');

radioInputs.forEach((input) => {
  input.addEventListener('change', () => {
    // change = 被勾選了
    if (input.value === 'morning') {
      bookingPrice.textContent = '新台幣 2000 元';
    } else {
      bookingPrice.textContent = '新台幣 2500 元';
    }
  });
});

fetch_attraction_data();
