from fastapi import *
from fastapi.responses import JSONResponse
from pydantic import BaseModel  # 用來規定前端傳來的資料必須是限定的格式
import jwt  # 用來製造「加密通行證」給使用者，並驗證通行證真偽
from auth import get_token


# 分離 py 檔
from config import SECRET_KEY, ALGORITHM
from database import pool

router = APIRouter()


# 使用 pydantic 取得前端傳來的資料
class BookingRequest(BaseModel):
    attractionId: int  # 景點的id 是int
    date: str  # 日期是字串 "2022-01-31"
    time: str  # 時間是字串 "afternoon"
    price: int  # 價格是整數


async def get_current_user(request: Request):
    # request: Request
    # request = 自已取的 變數名稱
    # Request = 代表"整個 HTTP 請求封包" (包含 Header, Cookie, IP, 來源等資訊)

    auth_header = request.headers.get("Authorization")
    # 從 request 中的 headers 取得 Authorization
    # Authorization 是 HTTP 請求中，專門用來放「通行證(Bearer)」的欄位。

    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=403, content={"error": True, "message": "未登入系統，拒絕存取"}
        )
    # 如果 Request 中根本沒有 Authorization 標頭 (沒帶票)，
    # 或者 開頭格式錯誤 (不是以 "Bearer " 開頭的票)
    # 回傳 403 error

    try:
        # 把 Bearer 和後面的亂碼 用空白切開，並且把亂碼存進 token 中
        token = auth_header.split(" ")[1]

        # 解析 Token (把加密的字串還原成字典資料)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # 從還原的資料中，取出會員的編號 (Database ID)
        member_id = payload["id"]

        return member_id
    except Exception:
        return JSONResponse(
            status_code=403, content={"error": True, "message": "未登入系統，拒絕存取"}
        )


@router.post("/api/booking")
async def booking_post(
    booking_request: BookingRequest,
    payload: dict = Depends(get_token),
    # Depends: 在執行這個 API 之前，"先去執行" get_current_user 函式
    # 並將驗證後的"回傳結果" (return value)，自動塞進 member_id 變數裡
):

    conn = None
    cursor = None
    # 先初始化變數為 None ，確保 finally 區塊檢查時不會因為"找不到變數"而報錯

    attraction_id = booking_request.attractionId
    booking_date = booking_request.date
    booking_time = booking_request.time
    booking_price = booking_request.price

    member_id = payload["id"]
    try:
        conn = pool.get_connection()
        cursor = conn.cursor()
        # 先刪除舊的
        cursor.execute("DELETE FROM booking WHERE member_id = %s", [member_id])
        # 再新增新的
        cursor.execute(
            "INSERT INTO booking(member_id,attraction_id,booking_date,booking_time,booking_price) VALUES (%s,%s,%s,%s,%s)",
            [member_id, attraction_id, booking_date, booking_time, booking_price],
        )
        conn.commit()
        return {"ok": True}

    except Exception as e:
        print("API /api/booking error:", e)
        return JSONResponse(
            status_code=500, content={"error": True, "message": "伺服器內部錯誤"}
        )
    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()


@router.get("/api/booking")
async def booking_get(member_id: int = Depends(get_current_user)):

    conn = None
    cursor = None

    try:
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """SELECT 
            attractions.id,
            attractions.name,
            attractions.address,
            booking.booking_date,
            booking.booking_time,
            booking.booking_price,
            (SELECT image_url FROM images WHERE attraction_id = attractions.id LIMIT 1)as image_url FROM booking
            INNER JOIN attractions 
            ON booking.attraction_id = attractions.id
            WHERE booking.member_id = %s
            ORDER BY booking.id DESC LIMIT 1;
            """,
            [member_id],
        )
        # ORDER BY ... DESC = 按降序排順序 ; LIMIT 1 = 只拿一筆
        # (SELECT image_url FROM images WHERE attraction_id = attractions.id LIMIT 1) as image_url
        # 子查詢 從 image_url 的 Table 中 找 和景點id一樣的圖片 只取 1 張，並命名成 image_url
        result = cursor.fetchone()
        if result:
            return {
                "data": {
                    "attraction": {
                        "id": result[0],
                        "name": result[1],
                        "address": result[2],
                        "image": result[6],
                    },
                    "date": str(result[3]),
                    "time": result[4],
                    "price": result[5],
                }
            }
        else:
            return {"data": None}

    except Exception as e:
        print("API /api/booking error:", e)
        return JSONResponse(
            status_code=500, content={"error": True, "message": "伺服器內部錯誤"}
        )
    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()


@router.delete("/api/booking")
async def booking_delete(member_id: int = Depends(get_current_user)):

    conn = None
    cursor = None

    try:
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM booking WHERE member_id=%s",
            [member_id],
        )
        conn.commit()
        return {"ok": True}
    except Exception:
        return JSONResponse(
            status_code=500, content={"error": True, "message": "伺服器內部錯誤"}
        )
    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()
