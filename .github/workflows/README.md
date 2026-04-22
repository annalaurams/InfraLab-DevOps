# CI/CD com GitHub Actions

## Visão geral

O pipeline de CI/CD automatiza o build, push da imagem Docker e deploy no Kubernetes a cada mudança no código.

```
git push / git tag
       ↓
GitHub Actions detecta
       ↓
build da imagem Docker
       ↓
push para o DockerHub
       ↓
deploy automático no Kubernetes
```

## Estratégia de deploy

| Gatilho | Ambiente | Imagem |
|---|---|---|
| push na branch `main` | dev | `devopspeople:dev-<sha-do-commit>` |
| tag `v*` (ex: `v1.0.0`) | prod | `devopspeople:v1.0.0` |

## Estrutura dos arquivos

```
.github/
└── workflows/
    ├── deploy-dev.yml    ← dispara no push da main
    └── deploy-prod.yml   ← dispara na criação de tag v*
```

## Pré-requisitos

### Self-hosted runner

O GitHub Actions usa um agente instalado na sua própria máquina para ter acesso ao cluster Minikube local.

**Instalação:**

```bash
# cria a pasta do runner
mkdir actions-runner && cd actions-runner

# baixa o runner
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/latest/download/actions-runner-linux-x64.tar.gz

# extrai
tar xzf ./actions-runner-linux-x64.tar.gz
```

**Configuração:**

O token de registro é gerado em:
`repositório → Settings → Actions → Runners → New self-hosted runner`

```bash
./config.sh --url https://github.com/SEU_USUARIO/SEU_REPO --token TOKEN_GERADO_NO_GITHUB
```

**Iniciar o runner:**

```bash
./run.sh
```

Mantenha esse terminal aberto enquanto quiser que o runner esteja ativo.

### Secrets no GitHub

Configure em: `repositório → Settings → Secrets and variables → Actions`

| Secret | Valor |
|---|---|
| `DOCKERHUB_USERNAME` | seu usuário do DockerHub |
| `DOCKERHUB_TOKEN` | token gerado em Account Settings → Security no DockerHub |

## Workflows

### Deploy Dev — `.github/workflows/deploy-dev.yml`

```yaml
name: Deploy Dev

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Checkout código
        uses: actions/checkout@v4.2.2

      - name: Login no DockerHub
        run: echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Build e push da imagem
        run: |
          docker build -t annalaurasm/devopspeople:dev-${{ github.sha }} .
          docker push annalaurasm/devopspeople:dev-${{ github.sha }}

      - name: Atualiza imagem no Kubernetes
        run: |
          kubectl set image deployment/api api=annalaurasm/devopspeople:dev-${{ github.sha }} -n dev
          kubectl rollout status deployment/api -n dev
```

### Deploy Prod — `.github/workflows/deploy-prod.yml`

```yaml
name: Deploy Prod

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Checkout código
        uses: actions/checkout@v4.2.2

      - name: Login no DockerHub
        run: echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Build e push da imagem
        run: |
          docker build -t annalaurasm/devopspeople:${{ github.ref_name }} .
          docker push annalaurasm/devopspeople:${{ github.ref_name }}

      - name: Atualiza imagem no Kubernetes
        run: |
          kubectl set image deployment/api api=annalaurasm/devopspeople:${{ github.ref_name }} -n prod
          kubectl rollout status deployment/api -n prod
```

## Como usar

### Deploy em dev

Qualquer push na branch `main` dispara automaticamente:

```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

### Deploy em prod

Crie e envie uma tag de versão:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Acompanhar o pipeline

Acesse a aba **Actions** no repositório do GitHub para ver o pipeline rodando em tempo real.

## Como as imagens ficam no DockerHub

```
annalaurasm/devopspeople:dev-a3f2c1d   ← build de dev com sha do commit
annalaurasm/devopspeople:v1.0.0        ← build de prod com tag da versão
annalaurasm/devopspeople:v1.1.0        ← próxima versão de prod
```

Cada deploy gera uma imagem com tag única — você consegue identificar exatamente qual commit está rodando em cada ambiente.

## Observações

- O runner precisa estar rodando (`./run.sh`) para o pipeline funcionar
- O Minikube precisa estar ativo (`minikube start`) antes do deploy
- O `imagePullPolicy: Always` nos deployments do Kubernetes garante que a nova imagem é sempre baixada do DockerHub
- Nunca commite o `secret.yml` do Kubernetes no repositório