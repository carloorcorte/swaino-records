import { z } from "zod";

export const contactTypes = ["demo", "press", "booking", "other"] as const;
export type ContactType = (typeof contactTypes)[number];

export const contactSchema = z.object({
  name: z.string().min(2, "name_min").max(80, "name_max").transform((v) => v.trim()),
  email: z.string().email("email_invalid").max(200, "email_max"),
  type: z.enum(contactTypes, { error: () => ({ message: "type_required" }) }),
  // Campi opzionali per segmento Demo
  streamingUrl: z
    .string()
    .url("url_invalid")
    .max(500)
    .optional()
    .or(z.literal("")),
  genre: z.string().max(50).optional().or(z.literal("")),
  // Campo opzionale per segmento Press
  publication: z.string().max(100).optional().or(z.literal("")),
  pressType: z.enum(["interview", "review", "accreditation", ""]).optional(),
  // Campo opzionale per segmento Booking
  eventDate: z.string().max(20).optional().or(z.literal("")),
  // Messaggio comune
  message: z
    .string()
    .min(10, "message_min")
    .max(1000, "message_max")
    .transform((v) => v.trim()),
  // Honeypot — deve essere vuoto
  website: z.string().max(0, "bot_detected").optional().or(z.literal("")),
  // Time check — compilato dal client
  _formTime: z.number().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
