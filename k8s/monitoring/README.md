# Observabilidade — Prometheus, Grafana e Loki

## Visão geral

A observabilidade permite monitorar em tempo real o que está acontecendo na aplicação sem precisar ficar executando `kubectl logs` manualmente. Três ferramentas trabalham juntas:

| Ferramenta | Função |
|---|---|
| Prometheus | Coleta e armazena métricas numéricas da API a cada 15s |
| Grafana | Exibe gráficos e dashboards com os dados do Prometheus e Loki |
| Loki | Coleta e centraliza os logs de todos os pods |

## Arquitetura

```
API FastAPI
    ↓ expõe /metrics
Prometheus coleta as métricas
    ↓
Grafana exibe dashboards e alertas

Todos os pods
    ↓ logs coletados pelo Promtail
Loki armazena os logs
    ↓
Grafana exibe os logs
```

## Instalação

### Pré-requisito — Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

### Adiciona os repositórios

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### Cria o namespace de monitoramento

```bash
kubectl create namespace monitoring
```

### Instala Prometheus + Grafana + AlertManager

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring
```

### Instala Loki + Promtail

```bash
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set promtail.enabled=true
```

### Verifica se subiu

```bash
kubectl get pods -n monitoring
```

## Instrumentação da API

Adiciona no `requirements.txt`:

```
prometheus-fastapi-instrumentator
```

Adiciona no `backend/main.py`:

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

Isso cria automaticamente o endpoint `/metrics` na API com métricas de requisições, latência e erros.

## ServiceMonitor

Cria o arquivo `k8s/monitoring/prometheus-servicemonitor.yml` para o Prometheus descobrir a API:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-monitor
  namespace: monitoring
  labels:
    release: monitoring
spec:
  namespaceSelector:
    matchNames:
      - prod
  selector:
    matchLabels:
      app: api
  endpoints:
    - port: http
      path: /metrics
      interval: 15s
```

Aplica:

```bash
kubectl apply -f k8s/monitoring/prometheus-servicemonitor.yml
```

O service da API em prod precisa ter o label `app: api` e a porta nomeada como `http` para o ServiceMonitor conseguir encontrá-lo:

```yaml
metadata:
  labels:
    app: api
spec:
  ports:
    - name: http
      port: 8000
```

## Acessar o Grafana

```bash
# pega a senha do admin
kubectl get secret -n monitoring monitoring-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d

# abre o port-forward
kubectl port-forward -n monitoring service/monitoring-grafana 3000:80
```

Acessa `http://localhost:3000` com usuário `admin` e a senha gerada.

## Acessar o Prometheus

```bash
kubectl port-forward -n monitoring service/monitoring-kube-prometheus-prometheus 9090:9090
```

Acessa `http://localhost:9090`.

## Dashboard no Grafana

Cria um dashboard em **Dashboards → New → New dashboard** com 4 painéis:

### Painel 1 — Requisições por segundo
```promql
rate(http_requests_total{namespace="prod"}[5m])
```

### Painel 2 — Latência média por rota
```promql
rate(http_request_duration_seconds_sum{namespace="prod"}[5m])
/
rate(http_request_duration_seconds_count{namespace="prod"}[5m])
```

### Painel 3 — Erros 5xx
```promql
rate(http_requests_total{namespace="prod", status=~"5.."}[5m])
```

### Painel 4 — Uso de memória dos pods
```promql
container_memory_usage_bytes{namespace="prod"}
```

## Alerta configurado

Em **Alerting → Alert rules → New alert rule**:

- **Nome:** `Erros 5xx na API`
- **Query:**
```promql
rate(http_requests_total{status=~"5..", namespace="prod"}[5m])
```
- **Condição:** `IS ABOVE 0`
- **Pending period:** `1m`
- **Folder:** `PeopleFlow`
- **Evaluation group:** `api-alerts` com intervalo de `1m`

O alerta fica em estado `Normal` enquanto não houver erros 5xx. Muda para `Firing` se erros persistirem por mais de 1 minuto.

## Verificar logs no Grafana (Loki)

Em **Explore → Loki**, usa as queries:

```
# todos os logs do namespace prod
{namespace="prod"}

# logs só da api
{namespace="prod", app="api"}

# logs do namespace monitoring
{namespace="monitoring"}
```

## Comandos úteis

```bash
# verificar se o endpoint /metrics está respondendo
curl http://192.168.49.2:30081/metrics

# verificar se o Loki está rodando
kubectl get pods -n monitoring | grep loki

# verificar o ServiceMonitor
kubectl get servicemonitor -n monitoring

# verificar se o Prometheus está descobrindo a API
kubectl get servicemonitor api-monitor -n monitoring -o yaml

# testar se o Prometheus alcança a API de dentro do cluster
kubectl exec -n monitoring prometheus-monitoring-kube-prometheus-prometheus-0 \
  -- wget -qO- http://api-service.prod.svc.cluster.local:8000/metrics | head -10
```

## Estrutura de arquivos

```
k8s/
└── monitoring/
    └── prometheus-servicemonitor.yml
```