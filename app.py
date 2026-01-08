from fastapi import *
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# 分離 py
from routers.attractions import router as attractions_router  # routers 是資料夾的名字
from routers.user import router as user_router  # 在後面加上一個 . 等於開啟資料夾的意思
from routers.booking import router as booking_router

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(attractions_router)  # include_router 是 FastAPI 的一個方法
app.include_router(user_router)  # 用來把 router 串起來
app.include_router(booking_router)


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
