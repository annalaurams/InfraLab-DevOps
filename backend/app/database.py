# configuração da conexão com o banco de dados, cria a sessão que salva e lê os dados

from sqlmodel import create_engine, SQLModel, Session
from app.config import settings
import app.model.user # Importante para o SQLModel registrar a tabela

database_url = settings.database_url

if database_url.startswith("sqlite"):
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(database_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session