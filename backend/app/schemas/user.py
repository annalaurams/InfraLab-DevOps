from uuid import UUID

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    cpf: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    zip_code: Optional[str] = None
    street: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    house_number: Optional[str] = None
    complement: Optional[str] = None
    education: Optional[str] = None
    job_title: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    role: str
    job_title: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True