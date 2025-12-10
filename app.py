from fastapi import *
from fastapi.responses import FileResponse
import mysql.connector

app = FastAPI()
con = mysql.connector.connect(
    user = "user",
    password = "12345678",
    host = "localhost",
    database = "taipei_day_trip"
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
    page : int = Query(...,ge=0),
	keyword: str = Query(None),
	category: str = Query(None)
):
    offset = page * 8
    base_sql = "SELECT id,name,category,description,address,transport,mrt,lat,lng FROM attractions"
    parameter_list = []
    condition_list = []
    if category != None:
        condition_list.append("category = %s")
        parameter_list.append(category)
    if keyword != None:
        condition_list.append("name LIKE %s OR mrt = %s")
        parameter_list.append(f"%{keyword}%")
        parameter_list.append(keyword)
    if condition_list:
        where_sql = " WHERE " + (" AND ".join(condition_list))
        result_sql = base_sql + where_sql
    else :
        result_sql = base_sql
    result_sql = result_sql + " LIMIT 8 OFFSET %s "
    parameter_list.append(offset)
    cursor = con.cursor()
    cursor.execute(result_sql,parameter_list)
    rows = cursor.fetchall()
    result_list = []
    for row in rows:
        attraction_id = row[0]
        cursor.execute("SELECT image_url FROM images WHERE attraction_id = %s",[attraction_id])
        image_rows =cursor.fetchall()
        images =[]
        for image_row in image_rows:
            images.append(image_row[0])
        attraction = {
            "id":row[0],
            "name":row[1],
            "category":row[2],
            "description":row[3],
            "address":row[4],
            "transport":row[5],
            "mrt":row[6],
            "lat":row[7],
            "lng":row[8]
        }
        result_list.append(attraction)
        result_list.append(images)
        if len(rows)<8:
            next_page =None
        else :
            next_page = page + 1
    cursor.close()
    return {"nextpage":next_page,"data":result_list}

@app.get("/api/attraction/{id}")
async def get_single_attraction(id : int):
    base_sql = "SELECT id,name,category,description,address,transport,mrt,lat,lng FROM attractions WHERE id = %s"
    cursor = con.cursor()
    cursor.execute(base_sql, (id,))
    row = cursor.fetchone()
    if row is None:
        return{
             "error":True,
             "message":"景點不存在"
        }
    attraction_id = row[0]
    sql_images = "SELECT image_url FROM images WHERE attraction_id = %s"
    cursor.execute(sql_images,(attraction_id,))
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


@app.get("/api/categories")
async def get_categories():
    cursor = con.cursor()
    cursor.execute("SELECT category FROM attractions")
    category_rows = cursor.fetchall()
    category_list=[]
    for category_row in category_rows:
         category_list.append(category_row[0])
    data = list(set(category_list))
    cursor.close()
    return{
         "data":data
    }

@app.get("/api/mrts")
async def get_mrts():
    cursor = con.cursor()
    cursor.execute("SELECT mrt FROM attractions")
    mrt_rows = cursor.fetchall()
    mrt_list=[]
    for mrt_row in mrt_rows:
        mrt_list.append(mrt_row[0])
    data = list(set(mrt_list))
    cursor.close()
    return{
         "data":data
    }