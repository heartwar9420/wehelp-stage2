import os  #  Operating System（作業系統）的縮寫
from dotenv import load_dotenv  # 特別用來讀取 .env 檔案的模組

load_dotenv()  # 讀取密鑰
my_key = os.getenv("SECRET_KEY")  # 把密鑰存到 my_key 中

SECRET_KEY = my_key
ALGORITHM = "HS256"
# HS = 對稱式加密 (只有一把鑰匙，加密解密都用它，速度快)
# 256 = 加密強度 (像是指紋一樣複雜，幾乎無法暴力破解)
