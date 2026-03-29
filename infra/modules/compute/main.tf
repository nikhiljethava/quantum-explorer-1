terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project" {
  type = string
}

variable "region" {
  type = string
}

variable "api_image" {
  type = string
}

variable "web_image" {
  type = string
}

variable "db_connection_name" {
  type = string
}

variable "db_password_secret_id" {
  type = string
}

# FastAPI Backend Service (Agent Runtime)
resource "google_cloud_run_v2_service" "api_service" {
  name     = "navigator-api"
  location = var.region
  project  = var.project

  template {
    containers {
      image = var.api_image
      
      env {
        name  = "ENVIRONMENT"
        value = "prod"
      }
      
      # Pull DB password gracefully securely from Secret Manager
      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.db_password_secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi" # Sufficient for light quantum adapters and agent orchestration
        }
      }
    }
  }
}

# NextJS Frontend Web Service
resource "google_cloud_run_v2_service" "web_service" {
  name     = "navigator-web"
  location = var.region
  project  = var.project

  template {
    containers {
      image = var.web_image

      env {
        name  = "NEXT_PUBLIC_API_BASE_URL"
        value = google_cloud_run_v2_service.api_service.uri
      }
      
      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }
    }
  }
}

# Require IAM Authentication for API, but allow Web publicly
resource "google_cloud_run_v2_service_iam_member" "web_public_access" {
  project  = google_cloud_run_v2_service.web_service.project
  location = google_cloud_run_v2_service.web_service.location
  name     = google_cloud_run_v2_service.web_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "api_url" {
  value = google_cloud_run_v2_service.api_service.uri
}

output "web_url" {
  value = google_cloud_run_v2_service.web_service.uri
}
