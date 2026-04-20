# configuração da conexão com o banco de dados, cria a sessão que salva e lê os dados

import os
from sqlmodel import create_engine, SQLModel, Session, select
from app.config import settings
import app.model.user 
from app.model.user import User
from app.core.security import hash_password

database_url = settings.database_url

if database_url.startswith("sqlite"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(database_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def seed_dev_admin_if_empty():
    if not settings.debug:
        return

    admin_email = os.getenv("DEV_ADMIN_EMAIL", "admin@peopleflow.com")
    admin_password = os.getenv("DEV_ADMIN_PASSWORD", "admin123")
    admin_name = os.getenv("DEV_ADMIN_NAME", "Administrador")
    admin_role = os.getenv("DEV_ADMIN_ROLE", "admin")

    with Session(engine) as session:
        has_any_user = session.exec(select(User.id)).first()
        if has_any_user:
            return

        seed_user = User(
            full_name=admin_name,
            email=admin_email,
            password_hash=hash_password(admin_password),
            role=admin_role,
            is_active=True,
        )
        session.add(seed_user)
        session.commit()

def get_session():
    with Session(engine) as session:
        yield session