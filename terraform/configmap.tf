resource "kubernetes_config_map" "api_config" {
  metadata {
    name      = "api-config"
    namespace = kubernetes_namespace.main.metadata[0].name
  }

  data = {
    DEBUG                       = var.debug
    ALGORITHM                   = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = "120"
    POSTGRES_DB                 = var.postgres_db
    POSTGRES_USER               = var.postgres_user
    APP_ENV                     = var.app_env
  }
}