curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version


# adiciona os repositórios
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# cria o namespace de monitoramento
kubectl create namespace monitoring

# instala Prometheus + Grafana + AlertManager
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring

# instala Loki + Promtail (coleta de logs)
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set promtail.enabled=true


  kubectl get pods -n monitoring


  ad no requeriments prometheus-fastapi-instrumentator


  ABRE O GRAFANA

  # pega a senha do admin
kubectl get secret -n monitoring monitoring-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d

# abre o Grafana no browser
kubectl port-forward -n monitoring service/monitoring-grafana 3000:80

➜  Devops git:(main) ✗ kubectl get secret -n monitoring monitoring-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d
eWdPnOOqsT3BkbbXGcr3n2t2uKypsVz3xaAEltdZ