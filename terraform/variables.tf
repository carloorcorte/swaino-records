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
