from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routes import users, auth, address
from app.database import create_db_and_tables, seed_dev_admin_if_empty
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Criar o banco e as tabelas ao iniciar
    create_db_and_tables()
    seed_dev_admin_if_empty()
    yield

app = FastAPI(title="PeopleFlow API", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # origem do Vite em dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    if settings.debug:
        return RedirectResponse(url="http://localhost:5173/login", status_code=307)
    return {"message": "PeopleFlow API rodando!"}

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(address.router)
