# Kubernetes — Ambientes Dev e Prod

## Estrutura

```
k8s/
├── dev/
│   ├── namespace.yml
│   ├── configmap.yml
│   ├── secret.yml
│   ├── db-deployment.yml
│   ├── db-service.yml
│   ├── api-deployment.yml
│   └── api-service.yml
└── prod/
    ├── namespace.yml
    ├── configmap.yml
    ├── secret.yml
    ├── db-pvc.yml
    ├── db-deployment.yml
    ├── db-service.yml
    ├── api-deployment.yml
    └── api-service.yml
```

## Regras por ambiente

| | Dev | Prod |
|---|---|---|
| Réplicas da api | 1 | 2 |
| Banco de dados | emptyDir (dados não persistem) | PVC 5Gi (dados persistem) |
| DEBUG | true | false |
| NodePort | 30080 | 30081 |

## Primeira vez — subir do zero

```bash
# 1. sobe o minikube
minikube start --driver=docker

# 2. aponta o Docker para dentro do minikube
eval $(minikube docker-env)

# 3. builda a imagem
docker build -t devops-api:latest .

# 4. aplica os manifests (namespace sempre primeiro)
kubectl apply -f k8s/prod/namespace.yml
kubectl apply -f k8s/prod/

# ou para dev
kubectl apply -f k8s/dev/namespace.yml
kubectl apply -f k8s/dev/
```

## Próximas vezes — só subir

```bash
minikube start --driver=docker
```

Os pods sobem automaticamente — o Kubernetes lembra o estado anterior.

## Atualizar a aplicação após mudar o código

```bash
eval $(minikube docker-env)
docker build -t devops-api:latest .
kubectl rollout restart deployment/api -n prod
kubectl rollout restart deployment/api -n dev
```

## Verificar status

```bash
# ver pods
kubectl get pods -n prod
kubectl get pods -n dev

# ver serviços
kubectl get svc -n prod
kubectl get svc -n dev

# ver tudo
kubectl get all -n prod
kubectl get all -n dev

# logs da api
kubectl logs deployment/api -n prod
kubectl logs deployment/api -n dev

# acompanhar logs em tempo real
kubectl logs deployment/api -n prod -f
```

## Acessar no browser

```bash
minikube service api-service -n prod
minikube service api-service -n dev
```

## Acessar o banco

```bash
kubectl exec -n prod -it deployment/db -- psql -U anna -d peopleprod
kubectl exec -n dev -it deployment/db -- psql -U anna -d peopledev
```

## Inserir usuário admin manualmente

```bash
# 1. gera o hash da senha
python3 backend/gerarSenha.py

# 2. conecta no banco e insere
kubectl exec -n prod -it deployment/db -- psql -U anna -d peopleprod
```

```sql
INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'Nome', 'email@dominio.com', '<HASH>', 'admin', TRUE, NOW(), NOW());
```

## Deletar tudo

```bash
# remove todos os recursos mas mantém o minikube
kubectl delete -f k8s/prod/
kubectl delete -f k8s/dev/

# remove o cluster inteiro
minikube delete
```

## Observações

- O `secret.yml` nunca deve ir para o git — adicione ao `.gitignore`
- Após atualizar o frontend use aba anônima para evitar cache
- O IP do minikube pode mudar — sempre use `minikube service` para abrir no browser