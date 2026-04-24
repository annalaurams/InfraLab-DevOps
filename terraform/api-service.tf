resource "kubernetes_service" "api" {
  metadata {
    name      = "api-service"
    namespace = kubernetes_namespace.main.metadata[0].name
  }

  spec {
    type = "NodePort"

    selector = {
      app = "api"
    }

    port {
      port        = 8000
      target_port = 8000
      node_port   = var.node_port
    }
  }
}