# # Stage 1: build do React
# FROM node:22-alpine AS frontend-builder
# WORKDIR /app
# COPY frontend/package*.json ./
# RUN npm ci
# COPY frontend/ .
# RUN npm run build

# # Stage 2: imagem final — só Python
# FROM python:3.13-slim AS final
# WORKDIR /app

# COPY requirements.txt .
# COPY backend/pyproject.toml ./pyproject.toml

# RUN pip install uv
# RUN uv sync
# RUN pip install .
# RUN pip install uvicorn

# COPY backend/ .
# COPY --from=frontend-builder /app/dist ./frontend/dist

# EXPOSE 8000
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# Stage 1: build do React
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: imagem final
FROM python:3.13-slim AS final
WORKDIR /app

# Instala dependências primeiro (aproveita o cache do Docker)
RUN pip install uv
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

# Copia o conteúdo da pasta backend para a raiz /app
COPY backend/ .

# Copia o build do frontend para /app/frontend/dist
# Assim o Python encontra em os.path.join(os.getcwd(), "frontend/dist")
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

# Executa o uvicorn apontando para o main.py que agora está na raiz /app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]