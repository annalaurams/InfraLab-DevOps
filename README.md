
# PeopleFlow

Projeto de estudo em DevOps com um CRUD simples de usuários, dividido em backend e frontend.

## Objetivo

Explorar práticas de desenvolvimento e infraestrutura com uma aplicação web funcional, usando uma API em FastAPI e uma interface em React + Vite.

## Funcionalidades

- cadastro de usuários
- validação de CPF e e-mail
- preenchimento automático de endereço por CEP
- autenticação de usuários
- edição, listagem e exclusão de registros

## Estrutura das pastas

```text
Devops/
└── frontend/
		├── package.json
		├── vite.config.js
		├── README.md
		└── src/
				├── main.jsx
				├── App.jsx
				├── App.css
				├── index.css
				├── components/
				│   └── RegisterForm.jsx
				└── pages/
						├── Login.jsx
						├── UserList.jsx
						├── UserMenu.jsx
						├── EditUser.jsx
						└── DeleteUser.jsx
```

## Ferramentas e tecnologias

<p>
	<img src="https://img.shields.io/badge/C-00599C?style=for-the-badge&logo=c&logoColor=white" />
	<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
	<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
	<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
	<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
	<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
	<img src="https://img.shields.io/badge/SQLModel-4B8BBE?style=for-the-badge&logo=sqlalchemy&logoColor=white" />
	<img src="https://img.shields.io/badge/Uvicorn-2D3748?style=for-the-badge&logo=uvicorn&logoColor=white" />
</p>

## Como executar

### Backend

```bash
cd backend
uv sync
uv run fastapi dev main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentação

- Backend Swagger: http://127.0.0.1:8000/docs

## Observações

- O CEP é consultado em uma API externa e preenche o endereço automaticamente.
- O CPF é validado localmente.
