from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.model.user import User
from app.schemas.auth import LoginRequest
from app.core.security import verify_password # Você precisará criar essa função

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(login_data: LoginRequest, session: Session = Depends(get_session)):
    email = login_data.email.strip().lower()

    # 1. Busca o usuário pelo e-mail
    user = session.exec(select(User).where(User.email == email)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    # 2. Verifica se a senha está correta
    # O hash_password você já tem, agora precisa do verify_password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    return {
        "message": "Login realizado com sucesso!",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }