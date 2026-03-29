terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

variable "project" {
  type = string
}

variable "region" {
  type = string
}

variable "db_instance_name" {
  type = string
}

# Generate strong random database password
resource "random_password" "db_password" {
  length  = 24
  special = true
}

# Store into GCP Secret Manager
resource "google_secret_manager_secret" "db_pwd_secret" {
  project   = var.project
  secret_id = "postgres-db-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_pwd_secret_version" {
  secret      = google_secret_manager_secret.db_pwd_secret.id
  secret_data = random_password.db_password.result
}

# Cloud SQL Instance
resource "google_sql_database_instance" "default" {
  name             = var.db_instance_name
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
    }
  }
  
  deletion_protection = false # Disable for easy teardown in this template
}

resource "google_sql_database" "database" {
  name     = "navigator-db"
  instance = google_sql_database_instance.default.name
}

resource "google_sql_user" "navigator_user" {
  name     = "navigator-user"
  instance = google_sql_database_instance.default.name
  password = random_password.db_password.result
}

output "database_connection_name" {
  value = google_sql_database_instance.default.connection_name
}
output "database_password_secret_id" {
  value = google_secret_manager_secret.db_pwd_secret.name
}
