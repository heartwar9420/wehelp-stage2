from fastapi import *
from fastapi.responses import JSONResponse
from pydantic import BaseModel  # 用來規定前端傳來的資料必須是限定的格式
from auth import get_token
from datetime import datetime
import requests
import json
import random

# 分離 py 檔
from config import PARTNER_KEY, MERCHANT_ID
from database import pool


class Contact(BaseModel):
    name: str
    email: str
    phone: str


class Attraction(BaseModel):
    id: int
    name: str
    address: str
    image: str


class Trip(BaseModel):
    attraction: Attraction
    date: str
    time: str


class OrderModel(BaseModel):
    price: int
    trip: Trip
    contact: Contact


class OrderRequest(BaseModel):
    prime: str
    order: OrderModel


# {
# "prime": "前端從第三方金流 TapPay 取得的交易碼",
# "order": {
#     "price": 2000,
#     "trip": {
#     "attraction": {
#         "id": 10,
#         "name": "平安鐘",
#         "address": "臺北市大安區忠孝東路 4 段",
#         "image": "https://yourdomain.com/images/attraction/10.jpg"
#     },
#     "date": "2022-01-31",
#     "time": "afternoon"
#     },
#     "contact": {
#     "name": "彭彭彭",
#     "email": "ply@ply.com",
#     "phone": "0912345678"
#     }
#     }
# }


router = APIRouter()


@router.post("/api/orders")
async def create_order(
    request: OrderRequest,
    payload: dict = Depends(get_token),
):
    conn = None
    cursor = None

    now = datetime.now()
    date_time = now.strftime("%Y%m%d%H%M%S")
    random_num = random.randint(1, 999)
    order_number = f"{date_time}{random_num:03d}"
    # {random_num:03d}
    # 0：代表不夠位數要補 0
    # 3：代表總共要 3 位數
    # d：代表後面這個東西是整數 (decimal)

    price = request.order.price
    paid_status = 0
    attraction_id = request.order.trip.attraction.id
    order_date = request.order.trip.date
    order_time = request.order.trip.time
    contact_name = request.order.contact.name
    contact_phone = request.order.contact.phone
    contact_email = request.order.contact.email
    member_id = payload["id"]
    payment_details = None
    prime = request.prime

    try:
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
        INSERT INTO orders (order_number,price,paid_status,attraction_id,order_date,order_time,contact_name,contact_phone,contact_email,member_id,payment_details)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            [
                order_number,
                price,
                paid_status,
                attraction_id,
                order_date,
                order_time,
                contact_name,
                contact_phone,
                contact_email,
                member_id,
                payment_details,
            ],
        )
        conn.commit()

        headers = {"Content-Type": "application/json", "x-api-key": PARTNER_KEY}

        request_body = {
            "prime": prime,
            "partner_key": PARTNER_KEY,
            "merchant_id": MERCHANT_ID,
            "details": "TapPay Test",
            "amount": price,
            "cardholder": {
                "phone_number": contact_phone,
                "name": contact_name,
                "email": contact_email,
            },
            "remember": True,
        }

        responses = requests.post(
            "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
            headers=headers,
            json=request_body,
        )

        result = responses.json()
        details_str = json.dumps(result)
        if result["status"] == 0:
            cursor.execute(
                """
                UPDATE orders 
                SET paid_status = 1 , payment_details = %s
                WHERE order_number = %s;
                """,
                [details_str, order_number],
            )
            conn.commit()
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "number": order_number,
                        "payment": {"status": result["status"], "message": "付款成功"},
                    }
                },
            )
        if result["status"] != 0:
            cursor.execute(
                """
                UPDATE orders 
                SET payment_details = %s
                WHERE order_number =  %s;
                """,
                [details_str, order_number],
            )
            conn.commit()
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "number": order_number,
                        "payment": {"status": result["status"], "message": "付款失敗"},
                    }
                },
            )

    except Exception as e:
        print("API /api/orders error:", e)
        return JSONResponse(
            status_code=500, content={"error": True, "message": "伺服器內部錯誤"}
        )
    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()


@router.get("/api/order/{orderNumber}")
async def get_order(orderNumber: str, payload: dict = Depends(get_token)):
    conn = None
    cursor = None

    conn = pool.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM orders
        WHERE order_number = %s
        """,
        [orderNumber],
    )
    conn.commit()
    result = cursor.fetchall()
    print(result)
