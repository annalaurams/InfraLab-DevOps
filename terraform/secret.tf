resource "kubernetes_secret" "api_secret" {
  metadata {
    name      = "api-secret"
    namespace = kubernetes_namespace.main.metadata[0].name
  }

  data = {
    SECRET_KEY        = var.secret_key
    POSTGRES_PASSWORD = var.postgres_password
    DATABASE_URL      = var.database_url
  }
}