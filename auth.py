from fastapi import *
import jwt  # 用來製造「加密通行證」給使用者，並驗證通行證真偽
from config import SECRET_KEY, ALGORITHM


async def get_token(request: Request):
    # request: Request
    # request = 自已取的 變數名稱
    # Request = 代表"整個 HTTP 請求封包" (包含 Header, Cookie, IP, 來源等資訊)

    auth_header = request.headers.get("Authorization")
    # 從 request 中的 headers 取得 Authorization
    # Authorization 是 HTTP 請求中，專門用來放「通行證(Bearer)」的欄位。

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=403, detail="未登入系統，拒絕存取")
    # 如果 Request 中根本沒有 Authorization 標頭 (沒帶票)，
    # 或者 開頭格式錯誤 (不是以 "Bearer " 開頭的票)
    # 回傳 403 error

    try:
        # 把 Bearer 和後面的亂碼 用空白切開，並且把亂碼存進 token 中
        token = auth_header.split(" ")[1]

        # 解析 Token (把加密的字串還原成字典資料)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except Exception:
        raise HTTPException(status_code=403, detail="Token 無效或過期")
