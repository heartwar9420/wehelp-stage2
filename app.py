from fastapi import *
from fastapi.responses import FileResponse
import mysql.connector
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
con = mysql.connector.connect(
    user = "app_user",
    password = "12345678",
    host = "localhost",
    database = "taipei_day_trip",
    use_pure=True
)
print("database ready")

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")

# 定義 /api/attractions API:
@app.get("/api/attractions")
async def get_attractions(
    page : int = Query(...,ge=0), # query (...) 代表必填 , ge = 0 也就是 大於等於 0 
	keyword: str = Query(None),
	category: str = Query(None)
):
    try:
        offset = page * 8 # 計算從第幾筆資料開始抓
        base_sql = """
        SELECT id,name,category,description,address,transport,mrt,lat,lng
        FROM attractions 
        """
        parameter_list = [] # 在 SQL 中的 %s 要放什麼值
        condition_list = [] # 在 SQL 中要怎麼寫

        if category != None:
            condition_list.append("category = %s")
            parameter_list.append(category)

        if keyword != None:
            condition_list.append("(name LIKE %s OR mrt = %s)") # LIKE %台北% 這是 SQL 的模糊搜尋格式
            parameter_list.append(f"%{keyword}%") # 用 f-string 把 keyword 放到 % % 中
            parameter_list.append(keyword)

        if condition_list:
            where_sql = " WHERE " + (" AND ".join(condition_list)) # 把 condition_list 中 的字串用 AND 串起來
            result_sql = base_sql + where_sql

        else :
            result_sql = base_sql

        result_sql = result_sql + " LIMIT 9 OFFSET %s "
        parameter_list.append(offset)
        cursor = con.cursor()
        cursor.execute(result_sql,parameter_list) # 使用參數化查詢執行 SQL，讓參數安全地替換到 %s 位置
        rows = cursor.fetchall() # rows = 所有抓到的資料
        if len(rows) == 0: # 如果沒有抓到任何一筆資料的話
            cursor.close()
            return {"nextPage":None,
                    "data":[]}
        else :
            if len(rows) == 9:
                next_page = page + 1
            else :
                next_page = None
            page_rows = rows[:8]
            attraction_ids = [row[0]for row in page_rows] 
            # 上面這一行 = attraction_id = []
            # for row in rows:
            # attraction_ids.append(row[0])
            # 意思是 用 row 去跑 rows ， 然後把 row[0] 組成一個新的 list

            # 根據景點數量產生對應的 %s placeholder（例如 "%s,%s,%s"），用於 IN 查詢
            placeholders = ",".join(["%s"] * len(attraction_ids))
            # 上面的寫法用到的是 "[a]" *3 = ["a","a","a"]
            # 依照景點數量重複生成多個 "%s"，例如 ["%s","%s","%s"]
            # 因為筆數不是固定的（不一定是 8），所以不能把 %s 寫死
            # ",".join(["%s"] = 把多個 "%s" 用 "," 串成一條字串，變成 "%s,%s,%s"

            images_sql = f"""
    SELECT attraction_id , image_url
    FROM images
    WHERE attraction_id IN ({placeholders})
    """
            cursor.execute(images_sql,attraction_ids)
            image_rows = cursor.fetchall()
            images_dict = {}
            for image_row in image_rows:
                att_id = image_row[0]
                img = image_row[1]
                if att_id not in images_dict: # 先建立一個list
                    images_dict[att_id] = []
                images_dict[att_id].append(img) # 再把資料append進去，不然會報錯
        result_list =[]
        for row in page_rows:
            # dict.get(key, default)
            images = images_dict.get(row[0],[]) # 從 images_dict 取出圖片清單，如果沒有這個 key(也就是如果沒有圖片的話) 就回傳 [] (default)
            attraction = {
                "id":row[0],
                "name":row[1],
                "category":row[2],
                "description":row[3],
                "address":row[4],
                "transport":row[5],
                "mrt":row[6],
                "lat":row[7],
                "lng":row[8],
                "images":images
            }
            result_list.append(attraction)
                
        cursor.close()
        return {"nextPage":next_page,
                "data":result_list}
    except Exception as e:
        print("API /api/attractions error:", e)
    return {
        "error": True,
        "message": "伺服器內部錯誤"
    }

@app.get("/api/attraction/{id}")
async def get_single_attraction(id : int):
    base_sql = "SELECT id,name,category,description,address,transport,mrt,lat,lng FROM attractions WHERE id = %s"
    try:
        cursor = con.cursor()
        cursor.execute(base_sql, (id,)) # execute 的第二個參數一定要是「列表或 tuple」，不能只給一個值
                                        # (id,) 是一個只有一個元素的 tuple，所以要加逗號
        row = cursor.fetchone()
        if row is None:
            return{
                "error":True,
                "message":"景點不存在"
            }
        attraction_id = row[0]
        images_sql = "SELECT image_url FROM images WHERE attraction_id = %s"
        cursor.execute(images_sql,(attraction_id,))
        image_rows = cursor.fetchall()

        image_list = []
        for image_row in image_rows:
            image_list.append(image_row[0])
        attraction_data = {
            "id":row[0],
            "name":row[1],
            "category":row[2],
            "description":row[3],
            "address":row[4],
            "transport":row[5],
            "mrt":row[6],
            "lat":row[7],
            "lng":row[8],
            "images":image_list
        }
        cursor.close()
        return{
            "data":attraction_data
        }
    except Exception as e:
        print("API /api/attraction/{id} error:", e)
        return {
            "error": True,
            "message": "伺服器內部錯誤"
        }

@app.get("/api/categories")
async def get_categories():
    cursor = con.cursor()
    cursor.execute("SELECT DISTINCT category FROM attractions ORDER BY category ASC")
    category_rows = cursor.fetchall()
    category_list=[]
    for category_row in category_rows:
         category_list.append(category_row[0])
    data = list(category_list)
    cursor.close()
    return{
         "data":data
    }

@app.get("/api/mrts")
async def get_mrts():
    cursor = con.cursor()
    cursor.execute("SELECT DISTINCT mrt FROM attractions WHERE mrt IS NOT NULL ORDER BY mrt ASC")
    mrt_rows = cursor.fetchall()
    mrt_list=[]
    for mrt_row in mrt_rows:
        mrt_list.append(mrt_row[0])
    data = list(mrt_list)
    cursor.close()
    return{
         "data":data
    }