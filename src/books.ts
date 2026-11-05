import { initialBooks } from "./data";
import type { Book, Genre, GenreFilter } from "./types";

export const GENRES: Genre[] = ["fantasy", "sci-fi", "mystery", "non-fiction"];

export const STORAGE_KEY = "bookshelf:books";

export type NewBook = {
  title: string;
  author: string;
  genre: Genre;
  /** 1 to 5 stars, 0 means "not rated" */
  rating: number;
};

export type AddBookResult =
  | { ok: true; books: Book[] }
  | { ok: false; error: string };

type Filter = {
  genre: GenreFilter;
  query: string;
};

export function filterBooks(books: Book[], { genre, query }: Filter): Book[] {
  const normalizedQuery = query.trim().toLowerCase();
  return books.filter(
    (book) =>
      (genre === "all" || book.genre === genre) &&
      book.title.toLowerCase().includes(normalizedQuery)
  );
}

export function toggleRead(books: Book[], id: string): Book[] {
  return books.map((book) =>
    book.id === id ? { ...book, isRead: !book.isRead } : book
  );
}

export function removeBook(books: Book[], id: string): Book[] {
  return books.filter((book) => book.id !== id);
}

export function countRead(books: Book[]): number {
  return books.filter((book) => book.isRead).length;
}

/** Average of all rated books, rounded to one decimal. `null` if no book is rated. */
export function averageRating(books: Book[]): number | null {
  const rated = books.filter((book) => book.rating > 0);
  if (rated.length === 0) {
    return null;
  }
  const sum = rated.reduce((total, book) => total + book.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

/**
 * Adds a new, unread book with trimmed title and author.
 * Rejects a missing title or author, and a book whose title and author
 * (ignoring case) are already on the shelf.
 */
export function addBook(
  books: Book[],
  draft: NewBook,
  id: string
): AddBookResult {
  const title = draft.title.trim();
  const author = draft.author.trim();
  if (title === "") {
    return { ok: false, error: "Title is required." };
  }
  if (author === "") {
    return { ok: false, error: "Author is required." };
  }
  const isDuplicate = books.some(
    (book) =>
      book.title.trim().toLowerCase() === title.toLowerCase() &&
      book.author.trim().toLowerCase() === author.toLowerCase()
  );
  if (isDuplicate) {
    return { ok: false, error: "This book is already on your shelf." };
  }
  const book: Book = {
    id,
    title,
    author,
    genre: draft.genre,
    rating: draft.rating,
    isRead: false,
  };
  return { ok: true, books: [...books, book] };
}

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const book = value as Record<string, unknown>;
  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    typeof book.author === "string" &&
    GENRES.includes(book.genre as Genre) &&
    typeof book.rating === "number" &&
    Number.isInteger(book.rating) &&
    book.rating >= 0 &&
    book.rating <= 5 &&
    typeof book.isRead === "boolean"
  );
}

/** Parses saved books. `null` if nothing is saved or the data is not valid. */
export function parseBooks(raw: string | null): Book[] | null {
  if (raw === null) {
    return null;
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || !data.every(isBook)) {
    return null;
  }
  return data;
}

/** Loads the saved books, or the sample books if none are saved or valid. */
export function loadBooks(): Book[] {
  try {
    return parseBooks(localStorage.getItem(STORAGE_KEY)) ?? initialBooks;
  } catch {
    return initialBooks;
  }
}

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
    // Storage can be unavailable (private mode, full quota); the app still works.
  }
}
