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
