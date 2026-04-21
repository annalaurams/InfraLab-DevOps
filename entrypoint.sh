#!/bin/bash
set -e

echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

echo "Starting Backend (FastAPI)..."
cd /app
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Handle graceful shutdown
trap "kill $NGINX_PID $BACKEND_PID" SIGTERM SIGINT

wait $NGINX_PID $BACKEND_PID
