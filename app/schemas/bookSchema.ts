import { z } from 'zod'

export const BookSchema = z.object({
  id: z.string(),
  etag: z.string(),
  volumeInfo: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()).optional(),
    publisher: z.string().optional(),
    publishedDate: z.string().optional(),
    description: z.string().optional(),
    industryIdentifiers: z.array(z.object({ type: z.string(), identifier: z.string() })).optional(),
    pageCount: z.number().optional(),
    categories: z.array(z.string()).optional(),
    imageLinks: z
      .object({
        smallThumbnail: z.string(),
        thumbnail: z.string()
      })
      .optional(),
    language: z.string()
  })
})

export const BooksSchema = z.object({
  kind: z.string(),
  totalItems: z.number(),
  items: z.array(BookSchema)
})

export const BookDetailSchema = BookSchema

export const BookSearchSchema = z.object({
  kind: z.string(),
  totalItems: z.number(),
  items: z.array(BookSchema)
})

export type TBook = z.infer<typeof BookSchema>
