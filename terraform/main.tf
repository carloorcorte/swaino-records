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

# ─── Sanity CMS ─────────────────────────────────────────────────

resource "vercel_project_environment_variable" "sanity_project_id_preview" {
  project_id = vercel_project.swaino_records.id
  key        = "NEXT_PUBLIC_SANITY_PROJECT_ID"
  value      = var.sanity_project_id
  target     = ["preview"]
  # Nessun git_branch: disponibile su TUTTI i branch preview
}

resource "vercel_project_environment_variable" "sanity_dataset_preview" {
  project_id = vercel_project.swaino_records.id
  key        = "NEXT_PUBLIC_SANITY_DATASET"
  value      = var.sanity_dataset
  target     = ["preview"]
  # Nessun git_branch: disponibile su TUTTI i branch preview
}

resource "vercel_project_environment_variable" "sanity_project_id_production" {
  project_id = vercel_project.swaino_records.id
  key        = "NEXT_PUBLIC_SANITY_PROJECT_ID"
  value      = var.sanity_project_id
  target     = ["production"]
}

resource "vercel_project_environment_variable" "sanity_dataset_production" {
  project_id = vercel_project.swaino_records.id
  key        = "NEXT_PUBLIC_SANITY_DATASET"
  value      = var.sanity_dataset
  target     = ["production"]
}

# ─── Contact form — develop (preview) ───────────────────────────

resource "vercel_project_environment_variable" "contact_email_preview" {
  project_id = vercel_project.swaino_records.id
  key        = "CONTACT_EMAIL"
  value      = var.contact_email
  target     = ["preview"]
  git_branch = var.develop_branch
  sensitive  = false
}

resource "vercel_project_environment_variable" "resend_api_key_preview" {
  project_id = vercel_project.swaino_records.id
  key        = "RESEND_API_KEY"
  value      = var.resend_api_key
  target     = ["preview"]
  git_branch = var.develop_branch
  sensitive  = true
}

resource "vercel_project_environment_variable" "resend_from_email_preview" {
  project_id = vercel_project.swaino_records.id
  key        = "RESEND_FROM_EMAIL"
  value      = "onboarding@resend.dev"
  target     = ["preview"]
  git_branch = var.develop_branch
  sensitive  = false
}

# ─── Contact form — production ───────────────────────────────────

resource "vercel_project_environment_variable" "contact_email_production" {
  project_id = vercel_project.swaino_records.id
  key        = "CONTACT_EMAIL"
  value      = var.contact_email
  target     = ["production"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "resend_api_key_production" {
  project_id = vercel_project.swaino_records.id
  key        = "RESEND_API_KEY"
  value      = var.resend_api_key
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "resend_from_email_production" {
  project_id = vercel_project.swaino_records.id
  key        = "RESEND_FROM_EMAIL"
  value      = "noreply@swainorecords.com"
  target     = ["production"]
  sensitive  = false
}
