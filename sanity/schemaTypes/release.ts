import { defineType, defineField, defineArrayMember } from "sanity";

export const releaseType = defineType({
  name: "release",
  title: "Release",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "artist",
      title: "Artista",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Single", value: "single" },
          { title: "EP", value: "ep" },
          { title: "Album", value: "album" },
        ],
        layout: "radio",
      },
      initialValue: "single",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "year",
      title: "Anno",
      type: "number",
      validation: (r) => r.required().min(2000).max(2100).integer(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Art",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Descrizione / Note di produzione",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "bandcampUrl",
      title: "URL Bandcamp",
      type: "url",
      description: "Pagina pubblica del brano su Bandcamp",
    }),
    defineField({
      name: "bandcampEmbedId",
      title: "Bandcamp Embed ID",
      type: "string",
      description:
        'ID numerico per il player embedded. Vai sulla pagina Bandcamp → Share/Embed → copia il numero dopo album= (es. album=171756176). Bandcamp usa sempre album= anche per i singoli.',
    }),
    defineField({
      name: "soundcloudUrl",
      title: "URL SoundCloud",
      type: "url",
      description: "Pagina pubblica del brano su SoundCloud",
    }),
    defineField({
      name: "tracks",
      title: "Tracklist",
      type: "array",
      description: "Lascia vuoto per i single",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "position", title: "N°", type: "number" }),
            defineField({ name: "title", title: "Titolo traccia", type: "string" }),
            defineField({ name: "duration", title: "Durata (es. 3:42)", type: "string" }),
          ],
          preview: {
            select: { title: "title", subtitle: "duration", media: "position" },
            prepare({ title, subtitle, media }) {
              return { title: `${media}. ${title}`, subtitle };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "artist",
      media: "coverImage",
    },
  },
  orderings: [
    {
      title: "Anno (più recente prima)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
});
