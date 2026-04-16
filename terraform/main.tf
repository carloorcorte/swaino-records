terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }

  # In futuro: sposta lo state su Terraform Cloud
  # backend "remote" { ... }
}

provider "vercel" {
  # Il token viene letto dalla variabile d'ambiente VERCEL_API_TOKEN
}

resource "vercel_project" "swaino_records" {
  name      = var.project_name
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  # Sito pubblico — nessuna autenticazione Vercel richiesta
  vercel_authentication = {
    deployment_type = "none"
  }
}

# Ambiente develop — protetto da Vercel auth (solo team)
resource "vercel_project_environment_variable" "develop_env" {
  project_id = vercel_project.swaino_records.id
  key        = "NEXT_PUBLIC_ENV"
  value      = "develop"
  target     = ["preview"]
  git_branch = var.develop_branch
}

resource "vercel_project_environment_variable" "production_env" {
  project_id = vercel_project.swaino_records.id
  key        = "NEXT_PUBLIC_ENV"
  value      = "production"
  target     = ["production"]
}
