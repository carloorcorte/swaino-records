variable "project_name" {
  description = "Nome del progetto su Vercel"
  type        = string
  default     = "swaino-records"
}

variable "github_repo" {
  description = "Repo GitHub nel formato owner/repo"
  type        = string
  default     = "carloorcorte/swaino-records"
}

variable "develop_branch" {
  description = "Branch di staging collegato all'ambiente develop su Vercel"
  type        = string
  default     = "develop"
}

variable "contact_email" {
  description = "Indirizzo email destinatario del form di contatto"
  type        = string
  default     = "hello@swainorecords.com"
}

variable "resend_api_key" {
  description = "API key di Resend per l'invio email (sensibile)"
  type        = string
  sensitive   = true
}
