from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.model.user import User
from app.schemas.auth import LoginRequest
from app.core.security import verify_password # Você precisará criar essa função

router = APIRouter(prefix="/auth", tags=["Auth"])

from app.core.security import verify_password, create_access_token

@router.post("/login")
def login(login_data: LoginRequest, session: Session = Depends(get_session)):
    email = login_data.email.strip().lower()

    user = session.exec(select(User).where(User.email == email)).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})

    return {
        "message": "Login realizado com sucesso!",
        "access_token": token,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }