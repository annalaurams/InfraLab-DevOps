from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routes import users, auth, address
from app.database import create_db_and_tables, seed_dev_admin_if_empty
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from prometheus_fastapi_instrumentator import Instrumentator
import os
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_dev_admin_if_empty()
    yield

app = FastAPI(title="PeopleFlow API", lifespan=lifespan)

Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.49.2:30081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(address.router)

@app.get("/")
async def root():
    return RedirectResponse(url="/frontend/", status_code=307)

@app.get("/frontend/{catchall:path}")
async def serve_frontend(catchall: str):
    FRONTEND_DIST = os.path.join(os.getcwd(), "frontend", "dist")
    file_path = os.path.join(FRONTEND_DIST, catchall)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

app.mount("/frontend", StaticFiles(directory=os.path.join(os.getcwd(), "frontend", "dist"), html=True), name="frontend")