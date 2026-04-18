from datetime import date, datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    full_name: str
    cpf: Optional[str] = Field(unique=True, index=True)
    birth_date: Optional[date]
    gender: Optional[str]
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: str # 'admin', 'assistente', 'funcionario'
    
    # Endereço
    zip_code: Optional[str]
    street: Optional[str]
    neighborhood: Optional[str]
    city: Optional[str]
    state: Optional[str]
    house_number: Optional[str]
    complement: Optional[str]
    
    education: Optional[str]
    job_title: Optional[str]
    
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)