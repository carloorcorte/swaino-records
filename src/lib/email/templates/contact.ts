import type { ContactFormData } from "@/lib/schemas/contact";

const TYPE_LABELS: Record<string, string> = {
  demo: "Demo Submission",
  press: "Press / Media",
  booking: "Booking",
  other: "Altro",
};

export function buildContactSubject(type: string, name: string): string {
  const label = TYPE_LABELS[type] ?? type;
  return `[${label}] da ${name}`;
}

export function buildContactEmailText(data: ContactFormData): string {
  const lines = [
    `Da: ${data.name} <${data.email}>`,
    `Tipo: ${data.type}`,
    "",
  ];
  if (data.streamingUrl) lines.push(`Link streaming: ${data.streamingUrl}`);
  if (data.genre) lines.push(`Genere: ${data.genre}`);
  if (data.publication) lines.push(`Testata: ${data.publication}`);
  if (data.pressType) lines.push(`Tipo press: ${data.pressType}`);
  if (data.eventDate) lines.push(`Data evento: ${data.eventDate}`);
  lines.push("", "Messaggio:", data.message);
  return lines.join("\n");
}
