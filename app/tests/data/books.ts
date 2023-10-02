import { z } from 'zod'

import { BookSchema, BooksSchema } from '~/schemas/bookSchema'

export const DUMMY_BOOKS_RESPONSE = {
  items: [
    {
      id: 'VcDZDQAAQBAJ',
      etag: 'X+kYqn3FdlY',
      volumeInfo: {
        title: 'The E. Hoffmann Price Fantasy & Science Fiction MEGAPACK®',
        subtitle: '20 Classic Tales',
        authors: ['E. Hoffmann Price'],
        publisher: 'Wildside Press LLC',
        publishedDate: '2017-01-05',
        description:
          "Edgar Hoffmann Price (1898 - 1988) was an American writer of popular fiction (he was a self-titled 'fictioneer') for the pulp magazine marketplace. He is probably most famous for his collaboration with H. P. Lovecraft, \"Through the Gates of the Silver Key,\" though he published hundreds of other works. This volume is a good sampling of his fantasy and science fiction stories. Included are: THE PROPHET'S GRANDCHILDREN THE INFIDEL'S DAUGHTER THE WORD OF BENTLEY DESERT MAGIC SANCTUARY THE WOMAN IN THE CASE APPRENTICE MAGICIAN STRANGE GATEWAY SPOTTED SATAN KHOSRU'S GARDEN SHADOW CAPTAIN THE HANDS OF JANOS THE FIRE AND THE FLESH THE SHADOW OF SATURN DRAGON'S DAUGHTER THE MIRROR OF KO HUNG EXILE FROM VENUS ESCAPE FROM HYPER-SPACE THE SEVEN SECURITIES WHEN IN DOUBT, MUTATE If you enjoy this ebook, don't forget to search your favorite ebook store for \"Wildside Press Megapack\" to see more of the 300+ volumes in this series, covering adventure, historical fiction, mysteries, westerns, ghost stories, science fiction -- and much, much more!",
        industryIdentifiers: [
          {
            type: 'ISBN_13',
            identifier: '9781479424689'
          },
          {
            type: 'ISBN_10',
            identifier: '1479424684'
          }
        ],
        pageCount: 561,
        categories: ['Fiction'],
        imageLinks: {
          smallThumbnail:
            'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
          thumbnail:
            'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'
        },
        language: 'en'
      }
    }
  ],
  kind: 'books#volumes',
  totalItems: 1
} satisfies z.infer<typeof BooksSchema>

export const DUMMY_BOOK_RESPONSE = {
  id: 'VcDZDQAAQBAJ',
  etag: 'X+kYqn3FdlY',
  volumeInfo: {
    title: 'The E. Hoffmann Price Fantasy & Science Fiction MEGAPACK®',
    subtitle: '20 Classic Tales',
    authors: ['E. Hoffmann Price'],
    publisher: 'Wildside Press LLC',
    publishedDate: '2017-01-05',
    description:
      "Edgar Hoffmann Price (1898 - 1988) was an American writer of popular fiction (he was a self-titled 'fictioneer') for the pulp magazine marketplace. He is probably most famous for his collaboration with H. P. Lovecraft, \"Through the Gates of the Silver Key,\" though he published hundreds of other works. This volume is a good sampling of his fantasy and science fiction stories. Included are: THE PROPHET'S GRANDCHILDREN THE INFIDEL'S DAUGHTER THE WORD OF BENTLEY DESERT MAGIC SANCTUARY THE WOMAN IN THE CASE APPRENTICE MAGICIAN STRANGE GATEWAY SPOTTED SATAN KHOSRU'S GARDEN SHADOW CAPTAIN THE HANDS OF JANOS THE FIRE AND THE FLESH THE SHADOW OF SATURN DRAGON'S DAUGHTER THE MIRROR OF KO HUNG EXILE FROM VENUS ESCAPE FROM HYPER-SPACE THE SEVEN SECURITIES WHEN IN DOUBT, MUTATE If you enjoy this ebook, don't forget to search your favorite ebook store for \"Wildside Press Megapack\" to see more of the 300+ volumes in this series, covering adventure, historical fiction, mysteries, westerns, ghost stories, science fiction -- and much, much more!",
    industryIdentifiers: [
      {
        type: 'ISBN_13',
        identifier: '9781479424689'
      },
      {
        type: 'ISBN_10',
        identifier: '1479424684'
      }
    ],
    pageCount: 561,
    categories: ['Fiction'],
    imageLinks: {
      smallThumbnail:
        'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
      thumbnail:
        'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'
    },
    language: 'en'
  }
} satisfies z.infer<typeof BookSchema>
