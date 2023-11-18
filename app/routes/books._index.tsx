import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';

import BookCover from '~/components/BookCover';
import { BooksSchema } from '~/schemas/bookSchema';

export const meta: MetaFunction = () => {
  return [
    { title: 'Popular Books - ReadLog' },
    {
      name: 'description',
      content:
        'Explore a curated collection of popular books. Find your next great read on our platform.',
    },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:'fiction','nonfiction','mystery','science','fantasy'&orderBy=relevance&key=${context.env.GOOGLE_BOOKS_API_KEY}`
  );
  const data = await res.json();
  const books = BooksSchema.parse(data);
  return books;
}

export default function BooksRoute() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2" id="popular-books">
        Popular Books
      </h1>
      <ul
        aria-labelledby="popular-books"
        className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-items-center gap-x-12 gap-y-8 p-6"
      >
        {loaderData.items.map((book) => {
          return (
            <li className="w-full" key={book.id}>
              <Link to={`./${book.id}`}>
                <BookCover book={book} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
