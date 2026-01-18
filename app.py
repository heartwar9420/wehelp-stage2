from fastapi import *
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError  # 專門用來處理 Pydantic 錯誤的

# 分離 py
from routers.attractions import router as attractions_router  # routers 是資料夾的名字
from routers.user import router as user_router  # 在後面加上一個 . 等於開啟資料夾的意思
from routers.booking import router as booking_router
from routers.order import router as order_router

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(attractions_router)  # include_router 是 FastAPI 的一個方法
app.include_router(user_router)  # 用來把 router 串起來
app.include_router(booking_router)
app.include_router(order_router)


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


# 在這邊處理 422 錯誤 強制變 400
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"error": True, "message": "訂單建立失敗，輸入不正確或其他原因"},
    )


# 403 轉成正確的response
@app.exception_handler(HTTPException)
async def validation_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code, content={"error": True, "message": exc.detail}
    )
