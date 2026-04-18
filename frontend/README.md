# PeopleFlow Frontend

Interface web do projeto PeopleFlow, responsável pelo cadastro, edição, login e consulta de usuários.

## Funcionalidades

- Formulário de cadastro com máscara de CPF e CEP
- Preenchimento automático de endereço pelo CEP
- Tela de login
- Listagem de usuários
- Edição e exclusão de registros
- Layout responsivo com visual institucional

## Tecnologias

<p>
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
	<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
	<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
	<img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
	<img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
	<img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
</p>

## Estrutura

- src/components: componentes reutilizáveis
- src/pages: páginas da aplicação
- src/assets: arquivos estáticos
- src/main.jsx: entrada da aplicação

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
