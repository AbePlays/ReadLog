import { z } from 'zod'

export const BookSchema = z.object({
  id: z.string(),
  etag: z.string(),
  volumeInfo: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()),
    publisher: z.string(),
    publishedDate: z.string(),
    description: z.string(),
    industryIdentifiers: z.array(z.object({ type: z.string(), identifier: z.string() })).optional(),
    pageCount: z.number(),
    categories: z.array(z.string()),
    imageLinks: z.object({
      smallThumbnail: z.string(),
      thumbnail: z.string()
    }),
    language: z.string()
  })
})

export const BooksSchema = z.object({
  kind: z.string(),
  totalItems: z.number(),
  items: z.array(BookSchema)
})

export const BookDetailSchema = z.object({
  id: z.string(),
  volumeInfo: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()),
    publisher: z.string(),
    publishedDate: z.string(),
    description: z.string(),
    industryIdentifiers: z.array(z.object({ type: z.string(), identifier: z.string() })).optional(),
    pageCount: z.number(),
    printedPageCount: z.number(),
    categories: z.array(z.string()),
    averageRating: z.number().optional(),
    ratingsCount: z.number().optional(),
    imageLinks: z.object({
      smallThumbnail: z.string(),
      thumbnail: z.string(),
      small: z.string(),
      medium: z.string(),
      large: z.string(),
      extraLarge: z.string()
    }),
    language: z.string()
  })
})
