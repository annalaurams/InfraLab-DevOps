# Frontend

Interface web do projeto, um CRUD completo para usuários.

## Funcionalidades
- Preenchimento automático de endereço pelo CEP
- Tela de login
- Listagem, edição e exclusão usuário

# Estrutura de Pastas

```
frontend/
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── vite.config.js
└── src/
	├── App.jsx
	├── index.css
	├── main.jsx
	└── pages/
		├── DeleteUser.jsx
		├── EditUser.jsx
		├── Login.jsx
		├── RegisterForm.jsx
		├── UserList.jsx
		└── UserMenu.jsx
```

## Como rodar

```bash
npm install
npm run dev
```

Para gerar a build de produção:

```bash
npm run build
```

Para pré-visualizar a build:

```bash
npm run preview
```

## Scripts

- npm run dev: inicia o ambiente local
- npm run build: gera a versão de produção
- npm run lint: verifica problemas de código
- npm run preview: pré-visualiza a build

## Integração

O frontend consome a API do backend em http://localhost:8000.
