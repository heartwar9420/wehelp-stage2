import json
import mysql.connector
# 建立資料庫連線
con = mysql.connector.connect(
    user = "root",
    password = "12345678",
    host = "localhost",
    database = "taipei_day_trip"
)
print("連線成功")

cursor = con.cursor()

## 讀取JSON檔
with open("taipei-day-trip/data/taipei-attractions.json", 'r' ,encoding="utf-8") as f:
    content = f.read()
mydict = json.loads(content) # 把 json檔 用字典的方式存取
# print(mydict['result'].keys()) # 用 .keys 來看在 result 底下有哪些分類
# print(mydict['result']['results']) # 找到我們要的資料
attractions = mydict['result']['results']

for item in attractions:
    id = item["_id"]
    name = item["name"]
    category = item["CAT"]
    description = item["description"]
    address = item["address"]
    transport = item["direction"]
    mrt = item["MRT"]
    lat = float(item["latitude"])
    lng = float(item["longitude"])
    file = item["file"]
    segments = file.split("http")
    cursor.execute(
                """
                INSERT INTO attractions(id,name,category,description,address,transport,mrt,lat,lng) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                [id,name,category,description,address,transport,mrt,lat,lng]
            )

    images = []
    for segment in segments :
        if len(segment) == 0 :
            continue
        else :
            url = "http" + segment.lower()
            if ".jpg" in url :
                pos = url.find(".jpg")
                clean_url = url[:pos + 4]
                images.append(clean_url)
            elif ".png" in url :
                pos = url.find(".png")
                clean_url = url[:pos + 4]
                images.append(clean_url)
            elif ".jpeg" in url :
                pos = url.find(".jpeg")
                clean_url = url[:pos + 5]
                images.append(clean_url)
            else:
                continue
    for clean_url in images:
        cursor.execute(
                    """
                    INSERT INTO images(image_url,attraction_id) 
                    VALUES (%s, %s)
                    """,
                    [clean_url,id]
                )
con.commit()