# DevOps na Prática

## Descrição

Projeto fullstack com backend em Python (FastAPI), frontend em React (Vite) e banco de dados PostgreSQL. O objetivo é estudar e aplicar práticas e ferramentas de DevOps em uma aplicação real de cadastro de usuários com autenticação, CRUD completo e integração com API externa (ViaCEP).

## Tecnologias

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
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" />
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" />
  <img src="https://img.shields.io/badge/Loki-F5A800?style=for-the-badge&logo=grafana&logoColor=white" />
</p>

## Funcionalidades da aplicação

- Cadastro de usuários com validação de CPF e e-mail
- Autenticação com JWT
- Preenchimento automático de endereço via CEP (ViaCEP)
- Listagem, edição e exclusão de usuários
- Controle de acesso por perfil (role)

## Estrutura do projeto

```
InfraLab-DevOps/
├── backend/                    # API FastAPI
├── frontend/                   # Interface React + Vite
├── k8s/                        # Manifests Kubernetes
│   ├── dev/                    # Ambiente de desenvolvimento
│   ├── prod/                   # Ambiente de produção
│   └── monitoring/             # ServiceMonitor do Prometheus
├── terraform/                  # Infraestrutura como código (dev)
│   └── dev/
│       └── terraform.tfvars
├── .github/
│   └── workflows/              # Pipelines CI/CD
│       ├── deploy-dev.yml
│       └── deploy-prod.yml
├── Dockerfile                  # Build multi-stage
├── docker-compose.dev.yml      # Ambiente de desenvolvimento
├── docker-compose.prod.yml     # Ambiente de produção
└── README.md
```

## Infraestrutura DevOps

| Camada | Ferramenta | Descrição |
|---|---|---|
| Conteinerização | Docker | Dockerfile multi-stage para build enxuto |
| Orquestração local | Docker Compose | Ambientes dev e prod separados |
| Orquestração em cluster | Kubernetes | Deployments, Services, Secrets, ConfigMaps, PVC |
| IaC | Terraform | Gerencia o namespace dev no Minikube |
| CI/CD | GitHub Actions | Build, push DockerHub e deploy automático |
| Métricas | Prometheus | Coleta métricas da API a cada 15s |
| Dashboards | Grafana | Painéis de requisições, latência, memória e alertas |
| Logs | Loki + Promtail | Centraliza logs de todos os pods |

## Como rodar

### Com Docker Compose

```bash
# desenvolvimento — com hot reload
docker compose -f docker-compose.dev.yml up --build

# produção
docker compose -f docker-compose.prod.yml up --build -d
```

| Ambiente | URL |
|---|---|
| Frontend (dev) | http://localhost:5173 |
| API (dev e prod) | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |

### Com Kubernetes (Minikube)

```bash
# sobe o cluster
minikube start --driver=docker

# builda a imagem dentro do Minikube
eval $(minikube docker-env)
docker build -t devops-api:latest .

# aplica os manifests
kubectl apply -f k8s/prod/namespace.yml
kubectl apply -f k8s/prod/

# abre no browser
minikube service api-service -n prod
```

| Ambiente | URL |
|---|---|
| Produção | http://\<minikube-ip\>:30081/frontend/login |
| Desenvolvimento | http://\<minikube-ip\>:30082/frontend/login |

### Com Terraform (ambiente dev)

```bash
cd terraform
terraform init
terraform plan -var-file="dev/terraform.tfvars"
terraform apply -var-file="dev/terraform.tfvars"
```

## CI/CD

O pipeline do GitHub Actions roda automaticamente:

| Gatilho | Ambiente | O que faz |
|---|---|---|
| Push na `main` | dev | build → push DockerHub → deploy no namespace dev |
| Tag `v*` | prod | build → push DockerHub → deploy no namespace prod |

Requer um self-hosted runner rodando na sua máquina:

```bash
cd actions-runner
./run.sh
```

## Observabilidade

```bash
# abre o Grafana
kubectl port-forward -n monitoring service/monitoring-grafana 3000:80
# acessa http://localhost:3000

# abre o Prometheus
kubectl port-forward -n monitoring service/monitoring-kube-prometheus-prometheus 9090:9090
# acessa http://localhost:9090
```

## Documentação por módulo

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)
- [Kubernetes](k8s/README.md)
- [Observabilidade](k8s/monitoring/README.md)
- [Terraform](terraform/README.md)