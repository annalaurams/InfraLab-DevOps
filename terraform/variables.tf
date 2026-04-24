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