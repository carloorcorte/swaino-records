output "project_id" {
  description = "Vercel project ID"
  value       = vercel_project.swaino_records.id
}

output "develop_branch" {
  description = "Branch collegato all'ambiente develop"
  value       = var.develop_branch
}
