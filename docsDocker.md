# 📦 Documentação Docker - InfraLab DevOps

## 📋 Índice
1. [Dockerfile](#dockerfile)
2. [Docker Compose Dev](#docker-compose-dev)
3. [Docker Compose Prod](#docker-compose-prod)
4. [Arquivos .env](#arquivos-env)
5. [Como Funciona](#como-funciona)
6. [Comandos Úteis](#comandos-úteis)

---

## 🏗️ Dockerfile

O `Dockerfile` usa **build multi-stage** para otimizar a imagem final. Tem 2 estágios:

### **Stage 1: `frontend-builder`** (Construir React/Vite)

```dockerfile
FROM node:22-alpine AS frontend-builder
```
- **FROM node:22-alpine**: Usa Node.js versão 22 em Alpine Linux (imagem bem leve, ~40MB)
- **AS frontend-builder**: Nomeamos este stage como `frontend-builder` para referenciá-lo depois

```dockerfile
WORKDIR /app
```
- Define o diretório de trabalho dentro do container como `/app`
- Todos os comandos seguintes rodam em `/app`

```dockerfile
COPY frontend/package*.json ./
```
- Copia `package.json` e `package-lock.json` (se existe) da máquina host para `/app` no container
- O `*` significa "qualquer arquivo que comece com package e termine com .json"
- Faz isso antes de copiar o código inteiro para aproveitar o cache do Docker

```dockerfile
RUN npm ci
```
- **npm ci** (clean install) = instala as dependências de forma determinística
- Melhor que `npm install` em Docker porque garante que todas as dependências sejam exatamente as do `package-lock.json`

```dockerfile
COPY frontend/ .
```
- Copia todo o código React/Vite do diretório `frontend/` do host para `/app` no container

```dockerfile
RUN npm run build
```
- Executa `npm run build` para compilar React/Vite
- Gera a pasta `/app/dist` com os arquivos estáticos otimizados (HTML, JS, CSS minificados)

---

### **Stage 2: `final`** (Imagem final com Python)

```dockerfile
FROM python:3.13-slim AS final
```
- Nova imagem base: Python 3.13 em Slim (bem mais leve que a padrão)
- **Importante**: Este stage não tem Node.js, só Python. A imagem final é **~300MB** em vez de **~1GB**
- **AS final**: É o stage que será usado para criar a imagem final

```dockerfile
WORKDIR /app
```
- Define `/app` como diretório de trabalho (mesmo do stage anterior, mas em imagem diferente)

```dockerfile
COPY requirements.txt .
```
- Copia o arquivo `requirements.txt` com as dependências Python

```dockerfile
RUN pip install -r requirements.txt
```
- Instala todas as dependências Python listadas em `requirements.txt`

```dockerfile
COPY backend/ .
```
- Copia o código Python/FastAPI do diretório `backend/` para `/app`

```dockerfile
COPY --from=frontend-builder /app/dist ./frontend/dist
```
- **--from=frontend-builder**: Pega arquivo de outro stage (o stage anterior que construiu React)
- Copia `/app/dist` do stage `frontend-builder` para `/app/frontend/dist` no stage `final`
- Dessa forma, o frontend compilado fica disponível para servir junto com o backend

```dockerfile
EXPOSE 8000
```
- Documenta que a aplicação escuta na porta 8000
- **Nota**: Não mapeia a porta, `docker-compose` faz isso com `ports:`

```dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
- Comando padrão que roda quando o container inicia
- **Uvicorn**: Servidor ASGI para Python/FastAPI
- **main:app**: Importa `app` do arquivo `main.py` 
- **--host 0.0.0.0**: Escuta em qualquer interface de rede (necessário para Docker)
- **--port 8000**: Escuta na porta 8000

---

## 🐳 Docker Compose Dev

Arquivo: `docker-compose.dev.yml`

O Docker Compose define 3 serviços que rodam juntos: `frontend`, `api` e `db`.

### Serviço: **frontend**

```yaml
services:
  frontend:
    image: node:22-alpine
```
- **image**: Usa imagem pronta do Docker Hub (Node 22 Alpine)
- Não faz build local, só roda um container Node

```yaml
    working_dir: /app
```
- Define `/app` como diretório de trabalho (equivalente a `WORKDIR` no Dockerfile)

```yaml
    volumes:
      - ./frontend:/app
      - /app/node_modules
```
- **./frontend:/app**: Liga (mount) a pasta `frontend/` da máquina host para `/app` no container
  - Mudanças em arquivo no host aparecem em tempo real no container (hot-reload)
- **/app/node_modules**: Volume anônimo para `node_modules`
  - Evita que `node_modules` da máquina host sobrescreva o do container
  - O container tem seus próprios `node_modules` instalados

```yaml
    ports:
      - "5173:5173"
```
- **5173:5173**: Mapeia porta 5173 do container para 5173 da máquina host
- Acessa em `http://localhost:5173`

```yaml
    command: sh -c "npm ci && npm run dev -- --host"
```
- **npm ci**: Instala dependências (idêntico ao Dockerfile)
- **npm run dev**: Roda script de desenvolvimento (Vite)
- **--host**: Faz Vite escutar em 0.0.0.0 (necessário para funcionar do host)

---

### Serviço: **api**

```yaml
  api:
    build:
      context: .
      target: final
```
- **build**: Não usa imagem pronta, faz build local
- **context: .**: Contexto é a raiz do projeto (onde está o `Dockerfile`)
- **target: final**: Usa o stage `final` do Dockerfile (pula `frontend-builder`)

```yaml
    volumes:
      - ./backend:/app
```
- Liga a pasta `backend/` do host para `/app` do container
- Mudanças no código Python aparecem em tempo real (graças ao `--reload` do uvicorn)

```yaml
    ports:
      - "8000:8000"
```
- Mapeia porta 8000 do container para 8000 do host
- API acessível em `http://localhost:8000`

```yaml
    env_file:
      - ./backend/.env.dev
```
- Carrega variáveis de ambiente do arquivo `.env.dev`
- As variáveis ficam disponíveis dentro do container (DATABASE_URL, SECRET_KEY, etc)

```yaml
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- Sobrescreve o `CMD` do Dockerfile
- **--reload**: Reinicia o server automaticamente quando código muda (desenvolvimento)

```yaml
    depends_on:
      db:
        condition: service_healthy
```
- **depends_on**: Define que `api` depende de `db`
- **condition: service_healthy**: Aguarda até que `db` passe no healthcheck
- Sem isso, `api` tentaria conectar no banco antes de estar pronto

---

### Serviço: **db**

```yaml
  db:
    image: postgres:16-alpine
```
- Imagem oficial PostgreSQL 16 em Alpine (versão super leve)

```yaml
    ports:
      - "5432:5432"
```
- Mapeia porta 5432 (PostgreSQL padrão) para acessar do host
- Permite usar `psql` localmente se quiser: `psql -h localhost -p 5432 -U postgres`

```yaml
    env_file:
      - ./backend/.env.dev
```
- Carrega variáveis de ambiente do `.env.dev`
- PostgreSQL lê `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` deste arquivo

```yaml
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
```
- **test**: Comando executado periodicamente para verificar se serviço está saudável
- **pg_isready**: Ferramenta do PostgreSQL que retorna código 0 se banco está pronto
- **$$POSTGRES_USER**: Interpolação de variáveis do `.env.dev` (username do banco)
- **$$POSTGRES_DB**: Nome do banco de dados

```yaml
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s
```
- **interval**: Checa a cada 5 segundos se o banco está saudável
- **timeout**: Timeout de 5 segundos para o comando `pg_isready` responder
- **retries**: Tenta até 10 vezes antes de marcar como "unhealthy"
- **start_period**: Aguarda 10 segundos antes de começar os healthchecks (ao subir)
  - Dá tempo del PostgreSQL inicializar

```yaml
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
```
- **postgres_dev_data**: Named volume que persiste dados do banco
- Sem isso, dados seriam perdidos quando container parar
- Docker manage automaticamente este volume

```yaml
volumes:
  postgres_dev_data:
```
- Define o named volume `postgres_dev_data` (ao final do arquivo)

---

## 🐳 Docker Compose Prod

Arquivo: `docker-compose.prod.yml`

Versão para **produção**. Diferenças importantes:

### Serviço: **api**

```yaml
  api:
    build:
      context: .
      target: final
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env.prod
```
- Mesmo build que dev, mas carrega `.env.prod` (credenciais reais, SECRET_KEY segura, DEBUG=false)
- Sem `volumes` (código não muda em prod)
- Sem `--reload` no comando (especificado no Dockerfile padrão)

```yaml
    restart: always
```
- Se container cair, Docker reinicia automaticamente
- Importante em produção para alta disponibilidade

```yaml
    depends_on:
      db:
        condition: service_healthy
```
- Mesma validação que dev

### Serviço: **db**

```yaml
  db:
    image: postgres:16-alpine
    env_file:
      - ./backend/.env.prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    restart: always
```
- Carrega credenciais reais de `.env.prod`
- Healthcheck idêntico ao dev
- Named volume `postgres_prod_data` para persistência
- **restart: always** = reinicia se cair

---

## 🔐 Arquivos .env

### `.env.dev` (Desenvolvimento)

Localização: `backend/.env.dev`

```bash
# Banco de dados
DATABASE_URL=postgresql://postgres:postgres@db:5432/appdb_dev
```
- **postgres:postgres** = user:password simplificado para dev
- **@db** = hostname do serviço db no docker-compose (resolve automaticamente)
- **appdb_dev** = nome do banco de dados

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=appdb_dev
```
- Variáveis que o PostgreSQL lê na inicialização
- Cria usuário `postgres` com senha `postgres` e banco `appdb_dev`

```bash
# Aplicação
SECRET_KEY=dev-secret-key
```
- Chave para assinar JWT tokens
- Insegura em dev, mas OK localmente

```bash
DEBUG=true
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
- **DEBUG=true**: Mostra stack traces detalhados em erros (desenvolvimento)
- **ALGORITHM**: Algoritmo de criptografia para JWT (HS256 = HMAC SHA-256)
- **ACCESS_TOKEN_EXPIRE_MINUTES=60**: Token expira em 60 minutos

```bash
# Seed de usuário admin para desenvolvimento
DEV_ADMIN_EMAIL=admin@peopleflow.com
DEV_ADMIN_PASSWORD=admin123
DEV_ADMIN_NAME=Administrador
DEV_ADMIN_ROLE=admin
```
- Credenciais de admin criadas automaticamente ao iniciar (se não houver usuários)

---

### `.env.prod` (Produção)

Localização: `backend/.env.prod`

```bash
DATABASE_URL=postgresql://anna:Anna182135@db:5432/appdb_prod
```
- **anna:Anna182135** = credenciais reais (não compartilhar no GitHub!)
- **appdb_prod** = banco de produção separado

```bash
POSTGRES_USER=anna
POSTGRES_PASSWORD=Anna182135
POSTGRES_DB=appdb_prod
```
- Credenciais reais para produção

```bash
SECRET_KEY=35c469d6589d67c749f132875471348d8614012a05c2d1de45faf15204a2211a
DEBUG=false
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
- **SECRET_KEY**: Gerada com `openssl rand -hex 32` (segura, 64 caracteres)
- **DEBUG=false**: Esconde detalhes em erros (segurança)
- **ACCESS_TOKEN_EXPIRE_MINUTES=30**: Tokens expiram em 30 minutos (mais seguro)

---

## 🔄 Como Funciona

### Fluxo de Execução (Dev)

1. **docker compose -f docker-compose.dev.yml up --build**

   ```
   a) Frontend:
      - Container Node 22
      - npm ci → npm run dev
      - Vite server rodando em http://localhost:5173
      - Hot-reload ativado (arquivo muda → auto recompila)
   
   b) PostgreSQL:
      - Container Postgres 16
      - Lê .env.dev → cria user 'postgres' e banco 'appdb_dev'
      - Healthcheck a cada 5s verificando se está pronto
      - Volume postgres_dev_data persiste dados
   
   c) API (FastAPI/Uvicorn):
      - Build Dockerfile (compila React → copia para backend)
      - Uvicorn inicia quando Postgres passa no healthcheck
      - Carrega .env.dev → conecta no banco
      - Servidor rodando em http://localhost:8000
      - --reload ativado (arquivo Python muda → reinicia)
   ```

2. **Conexões entre serviços**:
   - Frontend (localhost:5173) → API (http://localhost:8000) via HTTP
   - API → Postgres (postgresql://postgres:postgres@db:5432/appdb_dev)
   - Host (máquina local) → acessa tudo via localhost

### Fluxo de Execução (Prod)

1. **docker compose -f docker-compose.prod.yml up --build**

   ```
   - API: Build único (sem --reload), carrega .env.prod
   - DB: Postgres com credenciais reais, restart: always
   - Sem Frontend (React compilado está em /app/frontend/dist)
   - Sem volumes (código não muda)
   - API não expõe em localhost, pode ter Nginx na frente
   ```

---

## 🛠️ Comandos Úteis

### Iniciar ambiente

**Dev (com hot-reload):**
```bash
docker compose -f docker-compose.dev.yml up --build
```
- `--build`: Reconstrói imagens se houver mudanças no Dockerfile
- Outputs em tempo real do frontend, api e db

**Prod (simula produção):**
```bash
docker compose -f docker-compose.prod.yml up --build
```

### Parar containers

```bash
docker compose -f docker-compose.dev.yml down
```
- Para todos os containers
- Volumes persistem (dados não são deletados)

```bash
docker compose -f docker-compose.dev.yml down -v
```
- Para e **remove** volumes (limpa banco completamente)

### Acessar bancos de dados

**Interativo (dentro do container):**
```bash
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d appdb_dev
```
- Entra no prompt do psql
- `\l` = listar bancos
- `\dt` = listar tabelas
- `SELECT * FROM users;` = consultar dados
- `\q` = sair

**Diretamente (sem entrar no prompt):**
```bash
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d appdb_dev -c "SELECT * FROM users;"
```

### Ver logs

**Todos os serviços:**
```bash
docker compose -f docker-compose.dev.yml logs -f
```
- `-f` = follow (acompanha em tempo real)

**Só um serviço:**
```bash
docker compose -f docker-compose.dev.yml logs -f api
docker compose -f docker-compose.dev.yml logs -f db
docker compose -f docker-compose.dev.yml logs -f frontend
```

### Verificar status

```bash
docker compose -f docker-compose.dev.yml ps
```
- Mostra status de cada container

### Rebuild sem parar

```bash
docker compose -f docker-compose.dev.yml build
```
- Reconstrói imagens sem subir containers

```bash
docker compose -f docker-compose.dev.yml up -d --build
```
- `-d` = detached mode (roda em background)
- Pode fechar terminal

---

## 📊 Estrutura de Pastas Resultante

```
Depois de subir os containers, você tem:

Host Machine:
  /frontend                           → Código React/Vite
  /backend                            → Código Python/FastAPI
  /backend/.env.dev                   → Variáveis dev

Container frontend:
  /app/                               → Liga-se a ./frontend do host
  /app/node_modules/                  → Volume anônimo (isolado)
  /app/src/                           → Código Vite
  Saída: http://localhost:5173

Container api:
  /app/                               → Liga-se a ./backend do host
  /app/frontend/dist/                 → React compilado (do build stage)
  /app/main.py                        → Entrada FastAPI
  /app/app/                           → Código Python
  Saída: http://localhost:8000

Container db:
  /var/lib/postgresql/data/           → Volume postgres_dev_data
  Dados brutos do Postgres            → Persistem em postgres_dev_data
  Saída: localhost:5432
```

---

## ⚙️ Variáveis de Ambiente - Referência Rápida

| Variável | Dev | Prod | Descrição |
|----------|-----|------|-----------|
| DATABASE_URL | @db:5432 | @db:5432 | URL de conexão PostgreSQL |
| POSTGRES_USER | postgres | anna | Usuário Postgres |
| POSTGRES_PASSWORD | postgres | Anna182135 | Senha Postgres |
| POSTGRES_DB | appdb_dev | appdb_prod | Nome do banco |
| SECRET_KEY | dev-secret-key | 64 chars aleatórios | Assinatura JWT |
| DEBUG | true | false | Mostrar erros detalhados |
| ALGORITHM | HS256 | HS256 | Algo criptografia JWT |
| ACCESS_TOKEN_EXPIRE_MINUTES | 60 | 30 | Expiração token |

---

## 🔍 Troubleshooting

**"container has no healthcheck configured"**
- Solução: Adicionar `healthcheck` no serviço `db` (já feito aqui)

**"Database connection refused"**
- Esperou o healthcheck? Verificar: `docker compose ps` (db deve estar Healthy)
- Credenciais corretas no .env?

**"Port already in use"**
- Outra app usando 5173, 8000 ou 5432?
- `docker compose down` para limpar
- Ou mudar em `docker-compose.dev.yml` (ex: "5174:5173")

**Frontend não vê API**
- Frontend em localhost:5173 precisa chamar http://localhost:8000 (não @api)
- Ou deixa CORS configurado no FastAPI

---

**Documentação completa do projeto Docker. Qualquer dúvida sobre configuração, veja esta documentação! 🚀**
