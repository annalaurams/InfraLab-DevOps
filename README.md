# DevOps na Pŕatica

## Descrição
Projeto fullstack com backend em Python (FastAPI), frontend em React (Vite), banco de dados PostgreSQL e infraestrutura automatizada com Docker, Docker Compose e Kubernetes. O objetivo é fornecer uma aplicação de cadastro de usuários com autenticação, CRUD e integração via API, seguindo boas práticas de DevOps e estudando suas ferramentas.

## Tecnologias Utilizadas

<p align="left">
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


## Estrutura do Projeto

```
InfraLab-DevOps/
├── backend/           # Código do backend Python
├── frontend/          # Código do frontend React
├── k8s/               # Manifests do Kubernetes 
│   ├── dev/
│   └── prod/
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── dockerfile
├── README.md          # Este arquivo
```

Mais detalhes nas estruturas específicas:
- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
- [k8s/README.md](k8s/README.md)

## Como Rodar

### Ambiente de Desenvolvimento

1. Clone o repositório
2. Configure variáveis de ambiente em backend/.env.dev e frontend/.env
3. Suba os serviços com Docker Compose:
	```bash
	docker-compose -f docker-compose.dev.yml up --build
	```
4. O frontend estará em http://localhost:5173 e o backend em http://localhost:8000

## Estrutura DevOps

- Imagens Docker versionadas e publicadas no Docker Hub
- Orquestração de containers com Docker Compose (dev/prod)
- Deploy automatizado e escalável com Kubernetes (dev/prod)
- Separação clara de ambientes e configurações
- Uso de ConfigMap, Secret, PVC, Healthchecks e NodePort
- CI/CD com GitHub Actions (opcional)

---
Para instruções detalhadas de cada parte, consulte os READMEs das subpastas.