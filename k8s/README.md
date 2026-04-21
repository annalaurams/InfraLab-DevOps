# Kubernetes - Ambientes Dev e Prod

## Estrutura dos Ambientes

- `k8s/prod/`: Manifests para o ambiente de produção
- `k8s/dev/`: Manifests para o ambiente de desenvolvimento

## Regras e Especificações

- Cada ambiente possui seu próprio namespace (`prod` ou `dev`).
- Secrets e ConfigMaps são separados por ambiente.
- O banco de dados roda em um pod Postgres isolado por ambiente.
- O backend (API) é exposto via NodePort para acesso externo.
- O frontend buildado é servido pelo backend (FastAPI).
- Para desenvolvimento, o banco usa `emptyDir` (dados não persistem após reiniciar o pod).
- Para produção, o banco usa PVC (dados persistem).

## Comandos Úteis

### Iniciar o Minikube
```sh
minikube start
```

### Aplicar os manifests do ambiente desejado
```sh
# Ambiente de produção
kubectl apply -f k8s/prod/namespace.yml
kubectl apply -f k8s/prod/

# Ambiente de desenvolvimento
kubectl apply -f k8s/dev/namespace.yml
kubectl apply -f k8s/dev/
```

### Verificar pods e serviços
```sh
kubectl get pods -n prod
kubectl get svc -n prod
kubectl get pods -n dev
kubectl get svc -n dev
```

### Acessar a aplicação no navegador
```sh
minikube service api-service -n prod
minikube service api-service -n dev
```

### Acessar o banco de dados Postgres
```sh
kubectl exec -n prod -it deployment/db -- psql -U anna -d peopleprod
kubectl exec -n dev -it deployment/db -- psql -U anna -d peopledev
```

### Cadastrar usuário manualmente no banco
1. Gere o hash da senha:
   ```sh
   python3 backend/gerarSenha.py
   ```
2. No psql:
   ```sql
   INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
   VALUES (gen_random_uuid(), 'Nome', 'email@dominio.com', '<HASH>', 'admin', TRUE, NOW(), NOW());
   ```

### Buildar e atualizar o backend com frontend
```sh
# Build do frontend
cd frontend
npm install
npm run build
cp -r dist ../backend/frontend/

# Build da imagem Docker (na raiz do projeto)
docker build -t devops-api:latest -f dockerfile .

# Reinicie o deployment no Kubernetes
kubectl rollout restart deployment/api -n prod
kubectl rollout restart deployment/api -n dev
```

## Observações
- Sempre confira o IP do Minikube com `minikube ip`.
- Limpe o cache do navegador após atualizar o frontend.
- Use abas anônimas para evitar cache.
- Para logs detalhados de pods:
  ```sh
  kubectl logs deployment/api -n prod
  kubectl logs deployment/api -n dev
  ```
