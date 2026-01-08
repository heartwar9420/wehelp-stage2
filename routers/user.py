from fastapi import *
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import jwt  # 用來製造「加密通行證」給使用者，並驗證通行證真偽
from datetime import datetime, timedelta, timezone

# datetime  = 取得某個時間"點" (就像打卡鐘上的印記)
# timedelta = 代表"一段"時間長度 (就像計時器設定 7 天)
# timezone  = 世界時鐘 (用來區分是台灣時間還是美國時間)

# 分離 py 檔
from config import SECRET_KEY, ALGORITHM
from database import pool
from auth import get_token

router = APIRouter()


# 這是最基礎的，登入只需要這兩個
class MemberLogin(BaseModel):
    email: str
    password: str


# 這是註冊，繼承上面的 email 和 password，再多加一個 name
class MemberSignup(MemberLogin):
    name: str


# signup


@router.post("/api/user")
async def signup(member_signup: MemberSignup):
    member_email = member_signup.email
    member_password = member_signup.password
    member_name = member_signup.name
    conn = None
    cursor = None
    try:
        conn = pool.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM member WHERE email=%s", [member_email])
        result = cursor.fetchone()

        if result:
            return JSONResponse(
                status_code=400, content={"error": True, "message": "重複的電子郵件"}
            )
        cursor.execute(
            "INSERT INTO member(name, email, password) VALUES (%s,%s,%s)",
            [member_name, member_email, member_password],
        )

        conn.commit()

        return {"ok": True}
    except Exception as e:
        print("API /api/user error:", e)
        return JSONResponse(
            status_code=500, content={"error": True, "message": "伺服器內部錯誤"}
        )
    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()


# user_info


@router.get("/api/user/auth")
async def get_user_info(payload: dict = Depends(get_token)):
    return {
        "data": {
            "id": payload["id"],
            "name": payload["name"],
            "email": payload.get("email"),
        }
    }


# login


@router.put("/api/user/auth")
async def login(member_login: MemberLogin):
    member_email = member_login.email
    member_password = member_login.password
    conn = None
    cursor = None
    try:
        conn = pool.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, name, email FROM member WHERE email=%s AND password=%s",
            [member_email, member_password],
        )
        user = cursor.fetchone()

        if not user:
            return JSONResponse(
                status_code=400, content={"error": True, "message": "帳號或密碼錯誤"}
            )

        payload = {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "exp": datetime.now(timezone.utc) + timedelta(days=7),  # 設定過期時間
        }

        # 製作 Token
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        # 依照規格回傳 token
        return {"token": token}

    except Exception as e:
        print("API /api/member error:", e)
        return JSONResponse(
            status_code=500, content={"error": True, "message": "伺服器內部錯誤"}
        )
    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()
