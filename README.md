# Laboratório de Infraestrutura DevOps

Projeto de estudo em DevOps com um CRUD simples de usuários, dividido em backend e frontend.

## Objetivo

Explorar práticas de desenvolvimento e infraestrutura com uma aplicação web funcional, usando uma API em FastAPI e uma interface em React + Vite.

## Funcionalidades

- Cadastro de usuários
- Validação de CPF e e-mail
- Preenchimento automático de endereço por CEP
- Autenticação de usuários
- Edição, listagem e exclusão de registros

## Tecnologias

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Uvicorn-2D3748?style=for-the-badge&logo=uvicorn&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLModel-4B8BBE?style=for-the-badge&logo=sqlalchemy&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" />
</p>

## Requisitos

- Docker e Docker Compose
- Node.js 18+ (apenas para desenvolvimento local sem Docker)
- Python 3.14+ (apenas para desenvolvimento local sem Docker)

---

## Rodando com Docker

### Variáveis de ambiente

Antes de subir qualquer ambiente, crie os arquivos de variáveis dentro da pasta `backend/`:

```bash
cp backend/.env.example backend/.env.dev
cp backend/.env.example backend/.env.prod
```

Edite cada arquivo com os valores correspondentes ao ambiente.

---

### Ambiente de desenvolvimento

**Primeira vez — builda as imagens e sobe tudo:**
```bash
docker compose -f docker-compose.dev.yml up --build
```

**Próximas vezes — sobe sem rebuildar:**
```bash
docker compose -f docker-compose.dev.yml up
```

**Parar os containers:**
```bash
docker compose -f docker-compose.dev.yml down
```

**Parar e apagar os dados do banco:**
```bash
docker compose -f docker-compose.dev.yml down -v
```

Com o ambiente de desenvolvimento rodando:

- API: http://localhost:8000
- Documentação Swagger: http://localhost:8000/docs
- Frontend (Vite): http://localhost:5173

---

### Ambiente de produção

**Primeira vez — builda as imagens e sobe tudo em background:**
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

**Próximas vezes:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Parar os containers:**
```bash
docker compose -f docker-compose.prod.yml down
```

**Ver logs em tempo real:**
```bash
docker compose -f docker-compose.prod.yml logs -f
```

Com o ambiente de produção rodando:

- API + Frontend: http://localhost:8000
- Documentação Swagger: http://localhost:8000/docs

---

### Diferenças entre os ambientes

| | Desenvolvimento | Produção |
|---|---|---|
| Frontend | Vite com hot reload na porta 5173 | Build estático servido pelo FastAPI |
| Backend | Hot reload ativo | Sem hot reload |
| Banco | Porta 5432 exposta | Banco isolado, sem acesso externo |
| Debug | Ativado | Desativado |

---

## Estrutura do projeto

```
projeto/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── model/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── main.py
│   ├── .env.dev
│   ├── .env.prod
│   └── .env.example
├── frontend/
│   └── src/
├── k8s/
│   ├── dev/
│   └── prod/
├── Dockerfile
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

## Documentação por módulo

- Backend: [backend/README.md](backend/README.md)
<<<<<<< HEAD
- Frontend: [frontend/README.md](frontend/README.md)
=======
- Frontend: [frontend/README.md](frontend/README.md)
>>>>>>> 5cf722a (chore: ajustes locais antes do rebase)
