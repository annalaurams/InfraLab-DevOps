# Backend

API do projeto, responsável por autenticação, cadastro, exclusão, edição e listagem de usuários, além da consulta de endereço por CEP.

## Funcionalidades

- Cadastro de usuários com validação de e-mail e CPF
- Login com senha hash
- Listagem, edição e exclusão de usuários
- Busca de endereço por CEP via API externa
- Documentação automática com Swagger: `http://127.0.0.1:8000/docs`

## Estrutura

```text
Devops/
├── backend/
│   ├── main.py
│   ├── pyproject.toml
│   ├── README.md
│   └── app/
│       ├── config.py
│       ├── database.py
│       ├── core/
│       │   └── security.py
│       ├── model/
│       │   └── user.py
│       ├── routes/
│       │   ├── auth.py
│       │   ├── address.py
│       │   └── users.py
│       ├── schemas/
│       │   ├── auth.py
│       │   └── user.py
│       └── services/
│           └── viacep.py
```

## Execução

```bash
uv sync
uv run fastapi dev main.py
```

Se preferir rodar com Uvicorn:

```bash
uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Variáveis de ambiente

Crie um arquivo .env na raiz da pasta backend com a estrutura abaixo:

```env
database_url=postgresql+psycopg://usuario:senha@localhost:5432/nome_do_banco
secret_key=sua_chave_secreta
algorithm=HS256
```

Exemplos de database_url:

```env
database_url=sqlite:///./dev.db
database_url=postgresql+psycopg://postgres:postgres@localhost:5432/peopleflow
```

