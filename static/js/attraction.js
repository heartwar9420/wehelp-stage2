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

    console.log(data);

    console.log(data.images);

    console.log(data.name);
  } catch (err) {
    console.error('發生錯誤：', err);
  }
}

fetch_attraction_data();
