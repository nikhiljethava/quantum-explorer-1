variable "project_id" {
  description = "The GCP project ID to deploy into"
  type        = string
}

variable "region" {
  description = "Base region for GCP resources"
  type        = string
  default     = "us-central1"
}

variable "api_docker_image" {
  description = "Full Artifact Registry path for the API container"
  type        = string
}

variable "web_docker_image" {
  description = "Full Artifact Registry path for the Web container"
  type        = string
}
