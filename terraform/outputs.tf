output "namespace" {
  value = kubernetes_namespace.main.metadata[0].name
}

output "api_url" {
  value = "http://<minikube-ip>:${var.node_port}/frontend/login"
}

output "node_port" {
  value = var.node_port
}