import bcrypt
senha = "123456"
hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt())
print(hash.decode())