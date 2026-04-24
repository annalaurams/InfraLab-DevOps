resource "kubernetes_deployment" "api" {
  metadata {
    name      = "api"
    namespace = kubernetes_namespace.main.metadata[0].name
  }

  spec {
    replicas = var.api_replicas

    selector {
      match_labels = {
        app = "api"
      }
    }

    template {
      metadata {
        labels = {
          app = "api"
        }
      }

      spec {
        init_container {
          name    = "wait-for-db"
          image   = "busybox"
          command = ["sh", "-c", "until nc -z db 5432; do echo aguardando banco...; sleep 2; done"]
        }

        container {
          name              = "api"
          image             = "annalaurasm/devopspeople:latest"
          image_pull_policy = "Always"

          port {
            container_port = 8000
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.api_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.api_secret.metadata[0].name
            }
          }

          resources {
            requests = {
              memory = "128Mi"
              cpu    = "100m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }

          liveness_probe {
            http_get {
              path = "/docs"
              port = 8000
            }
            initial_delay_seconds = 15
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/docs"
              port = 8000
            }
            initial_delay_seconds = 10
            period_seconds        = 5
          }
        }
      }
    }
  }
}