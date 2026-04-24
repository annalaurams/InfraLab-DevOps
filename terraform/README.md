# Terraform — Infraestrutura como Código (IaC)

## Visão geral

O Terraform substitui os arquivos YAML do Kubernetes por código declarativo versionado. Em vez de gerenciar a infraestrutura com `kubectl apply`, você descreve o estado desejado em arquivos `.tf` e o Terraform cuida de criar, atualizar ou destruir os recursos.

O ambiente de **desenvolvimento** é gerenciado pelo Terraform. O ambiente de produção continua usando os YAMLs do Kubernetes diretamente.

## Por que usar Terraform

| | kubectl apply | Terraform |
|---|---|---|
| Controle de estado | Não | Sim |
| Sabe o que mudou | Não | Sim |
| Plano antes de aplicar | Não | Sim (`terraform plan`) |
| Destruição controlada | Manual | `terraform destroy` |
| Versionamento de infra | Só com git dos YAMLs | Nativo |

## Instalação

```bash
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# verifica a instalação
terraform version
```

## Estrutura de arquivos

```
terraform/
├── main.tf               ← provider Kubernetes
├── variables.tf          ← variáveis reutilizáveis
├── outputs.tf            ← valores exibidos após o apply
├── namespace.tf          ← namespace do cluster
├── configmap.tf          ← variáveis não sensíveis
├── secret.tf             ← variáveis sensíveis
├── db-pvc.tf             ← volume persistente do banco
├── db-deployment.tf      ← deployment do PostgreSQL
├── db-service.tf         ← service interno do banco
├── api-deployment.tf     ← deployment da API FastAPI
├── api-service.tf        ← service externo da API
└── dev/
    └── terraform.tfvars  ← valores específicos do dev
```

## Conteúdo dos arquivos

### `main.tf`
```hcl
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
}
```

### `variables.tf`
```hcl
variable "namespace" {
  type = string
}

variable "postgres_user" {
  type = string
}

variable "postgres_password" {
  type      = string
  sensitive = true
}

variable "postgres_db" {
  type = string
}

variable "secret_key" {
  type      = string
  sensitive = true
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "debug" {
  type    = string
  default = "false"
}

variable "app_env" {
  type    = string
  default = "prod"
}

variable "api_replicas" {
  type    = number
  default = 1
}

variable "node_port" {
  type    = number
  default = 30080
}
```

### `dev/terraform.tfvars`
```hcl
namespace         = "dev"
postgres_user     = "anna"
postgres_password = "SUA_SENHA_AQUI"
postgres_db       = "appdb_dev"
secret_key        = "dev-secret-key"
database_url      = "postgresql://anna:SUA_SENHA_AQUI@db:5432/appdb_dev"
debug             = "true"
app_env           = "dev"
api_replicas      = 1
node_port         = 30082
```

### `outputs.tf`
```hcl
output "namespace" {
  value = kubernetes_namespace.main.metadata[0].name
}

output "api_url" {
  value = "http://<minikube-ip>:${var.node_port}/frontend/login"
}

output "node_port" {
  value = var.node_port
}
```

## O que cada arquivo cria

| Arquivo | Kind Kubernetes equivalente |
|---|---|
| `namespace.tf` | Namespace |
| `configmap.tf` | ConfigMap |
| `secret.tf` | Secret |
| `db-pvc.tf` | PersistentVolumeClaim |
| `db-deployment.tf` | Deployment (PostgreSQL) |
| `db-service.tf` | Service (ClusterIP) |
| `api-deployment.tf` | Deployment (FastAPI) |
| `api-service.tf` | Service (NodePort) |

O Terraform converte os valores do `secret.tf` para base64 automaticamente — não é necessário rodar `echo -n "..." | base64` como nos YAMLs.

## Comandos

### Primeira vez

```bash
cd terraform

# baixa o provider Kubernetes
terraform init

# visualiza o que será criado sem aplicar nada
terraform plan -var-file="dev/terraform.tfvars"

# aplica o ambiente dev
terraform apply -var-file="dev/terraform.tfvars"
```

### Próximas vezes

```bash
# ver o estado atual
terraform show

# ver apenas os recursos gerenciados
terraform state list

# aplicar mudanças
terraform apply -var-file="dev/terraform.tfvars"

# destruir tudo do ambiente dev
terraform destroy -var-file="dev/terraform.tfvars"
```

### Importar recursos existentes

Se os recursos já foram criados com `kubectl apply` antes do Terraform, é necessário importá-los para o estado:

```bash
terraform import -var-file="dev/terraform.tfvars" kubernetes_namespace.main dev
terraform import -var-file="dev/terraform.tfvars" kubernetes_config_map.api_config dev/api-config
terraform import -var-file="dev/terraform.tfvars" kubernetes_secret.api_secret dev/api-secret
terraform import -var-file="dev/terraform.tfvars" kubernetes_persistent_volume_claim.postgres_pvc dev/postgres-pvc
terraform import -var-file="dev/terraform.tfvars" kubernetes_service.db dev/db
terraform import -var-file="dev/terraform.tfvars" kubernetes_service.api dev/api-service
terraform import -var-file="dev/terraform.tfvars" kubernetes_deployment.db dev/db
terraform import -var-file="dev/terraform.tfvars" kubernetes_deployment.api dev/api
```

## Diferença entre dev e prod

O ambiente de dev é gerenciado pelo Terraform. O ambiente de prod usa os YAMLs diretamente em `k8s/prod/`.

```
dev  → terraform apply -var-file="dev/terraform.tfvars"
prod → kubectl apply -f k8s/prod/
```

Quando quiser migrar prod para o Terraform também, basta criar `prod/terraform.tfvars` com os valores de produção e importar os recursos existentes.

## Acessar a aplicação após o apply

```bash
# pega o IP do Minikube
minikube ip

# acessa no browser
http://SEU_IP:30082/frontend/login
```

## Observações

- O arquivo `dev/terraform.tfvars` não deve ir para o git — adicione ao `.gitignore`
- Crie um `dev/terraform.tfvars.example` com as chaves mas sem os valores para referência do time
- O `terraform plan` sempre deve ser rodado antes do `apply` para revisar as mudanças
- O estado do Terraform fica salvo em `terraform.tfstate` — não delete esse arquivo