from datetime import datetime, timedelta
from jose import jwt
from app.config import settings
import hashlib
import bcrypt

def _prepare_password(password: str) -> bytes:
    raw = password.encode("utf-8")
    if len(raw) <= 72:
        return raw
    return hashlib.sha256(raw).hexdigest().encode("utf-8")

def hash_password(password: str) -> str:
    prepared = _prepare_password(password)
    return bcrypt.hashpw(prepared, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    prepared = _prepare_password(plain_password)
    return bcrypt.checkpw(prepared, hashed_password.encode("utf-8"))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)