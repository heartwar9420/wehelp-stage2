from mysql.connector import pooling  # 連線池

dbconfig = {
    "user": "app_user",
    "password": "12345678",
    "host": "localhost",
    "database": "taipei_day_trip",
    "use_pure": True,
}

pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **dbconfig)
print("connection pool ready")
