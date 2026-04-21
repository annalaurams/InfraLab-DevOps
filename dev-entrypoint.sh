#!/bin/sh
set -e

# Iniciar o backend (uvicorn) em background
echo "Starting Backend (FastAPI)..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Instalar dependências do frontend se node_modules não existir
if [ ! -d "/app/frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd /app/frontend
    npm ci
    cd /app
fi

# Iniciar o frontend (Vite) em background
echo "Starting Frontend (Vite)..."
cd /app/frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

cd /app

# Tratar shutdown gracioso
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" INT TERM

# Aguardar pelos processos
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

