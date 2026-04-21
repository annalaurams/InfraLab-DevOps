from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routes import users, auth, address
from app.database import create_db_and_tables, seed_dev_admin_if_empty
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_dev_admin_if_empty()
    yield

app = FastAPI(title="PeopleFlow API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8000",
        "http://192.168.49.2:30081",
        "http://192.168.49.2:5173",
        "http://192.168.49.2:30082"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(address.router)

@app.get("/")
async def root():
    if settings.debug:
        return RedirectResponse(url="http://localhost:5173/frontend", status_code=307)
    return RedirectResponse(url="/frontend", status_code=307)

FRONTEND_DIST = os.path.join(os.getcwd(), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/frontend", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

    @app.get("/frontend/{catchall:path}")
    async def serve_frontend(catchall: str):
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))