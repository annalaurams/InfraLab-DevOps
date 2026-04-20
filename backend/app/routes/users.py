from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session  
from app.model.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password

router = APIRouter(prefix="/users", tags=["Users"])

def normalize_digits(value: str | None) -> str | None:
    if value is None:
        return None
    digits = "".join(ch for ch in value if ch.isdigit())
    return digits or None


def is_valid_cpf(cpf: str | None) -> bool:
    if not cpf:
        return True

    cpf = normalize_digits(cpf) or ""
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False

    def calc_digit(base: str, factor: int) -> str:
        total = sum(int(d) * (factor - idx) for idx, d in enumerate(base))
        remainder = (total * 10) % 11
        return "0" if remainder == 10 else str(remainder)

    first = calc_digit(cpf[:9], 10)
    second = calc_digit(cpf[:10], 11)
    return cpf[-2:] == first + second

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, session: Session = Depends(get_session)):
    
    # 1. Verificar conflitos de e-mail e CPF
    user_dict = user_data.model_dump()
    user_dict["email"] = user_dict["email"].strip().lower()
    user_dict["cpf"] = normalize_digits(user_dict.get("cpf"))
    user_dict["zip_code"] = normalize_digits(user_dict.get("zip_code"))

    if not is_valid_cpf(user_dict.get("cpf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF inválido.",
        )

    existing_email = session.exec(
        select(User).where(User.email == user_dict["email"])
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário com este E-mail já cadastrado."
        )

    if user_dict["cpf"]:
        existing_cpf = session.exec(
            select(User).where(User.cpf == user_dict["cpf"])
        ).first()
        if existing_cpf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário com este CPF já cadastrado."
            )

    # 1. Extraímos os dados brutos em um dicionário
    # 2. Geramos o hash da senha
    password_plain = user_dict.pop("password")
    hashed = hash_password(password_plain)
    
    # 3. Criamos o objeto User passando os campos um a um

    new_user = User(**user_dict, password_hash=hashed)

    # 4. Persistência 
    try:
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user
    except Exception as e:
        session.rollback()
        print(f"Erro ao salvar: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao salvar no banco de dados."
        )
        
@router.get("/", response_model=List[User])
def list_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users

# 2. EDITAR (Para a opção "Editar usuário")
@router.put("/{user_id}")
def update_user(user_id: UUID, user_data: dict, session: Session = Depends(get_session)):
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    allowed_fields = {
        "full_name", "cpf", "birth_date", "gender", "email", "role",
        "zip_code", "street", "neighborhood", "city", "state", "house_number",
        "complement", "education", "job_title", "is_active"
    }

    user_dict = {k: v for k, v in user_data.items() if k in allowed_fields}
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum campo válido para atualização."
        )

    if "cpf" in user_dict:
        user_dict["cpf"] = normalize_digits(user_dict.get("cpf"))
        if not is_valid_cpf(user_dict.get("cpf")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF inválido.",
            )

    if "zip_code" in user_dict:
        user_dict["zip_code"] = normalize_digits(user_dict.get("zip_code"))

    for key, value in user_dict.items():
        setattr(db_user, key, value)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: UUID, session: Session = Depends(get_session)):
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    session.delete(db_user)
    session.commit()