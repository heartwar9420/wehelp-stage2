from fastapi import *
import jwt  # 用來製造「加密通行證」給使用者，並驗證通行證真偽
from config import SECRET_KEY, ALGORITHM
from fastapi.responses import JSONResponse


# request: Request
# request = 自已取的 變數名稱
# Request = 代表"整個 HTTP 請求封包" (包含 Header, Cookie, IP, 來源等資訊)
async def get_token(request: Request):

    # 先把token 設為None
    token = None

    # 從 request 中的 headers 取得 Authorization
    # Authorization 是 HTTP 請求中，專門用來放「通行證(Bearer)」的欄位。
    auth_header = request.headers.get("Authorization")

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    # 如果沒有 token 先去檢查cookies中有沒有token
    if not token:
        token = request.cookies.get("token")

    # 如果還是沒有 token 就判斷沒有登入
    if not token:
        raise HTTPException(status_code=403, detail="未登入系統，拒絕存取")

    # 解析 token 存到 payload 中
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except Exception:
        raise HTTPException(status_code=403, detail="Token 無效或過期")
