terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  # State backend configuration (Requires manually bootstrapping a storage bucket)
  # backend "gcs" {
  #   bucket = "navigator-terraform-state-prod"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Import Database Module
module "data" {
  source           = "../../modules/data"
  project          = var.project_id
  region           = var.region
  db_instance_name = "navigator-prod-db"
}

# Import Compute Module targetting built artifacts
module "compute" {
  source                = "../../modules/compute"
  project               = var.project_id
  region                = var.region
  api_image             = var.api_docker_image
  web_image             = var.web_docker_image
  db_connection_name    = module.data.database_connection_name
  db_password_secret_id = module.data.database_password_secret_id
}

output "deployed_url" {
  value = module.compute.web_url
}
