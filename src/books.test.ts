import { describe, expect, test } from "vitest";
import {
  addBook,
  averageRating,
  countRead,
  filterBooks,
  parseBooks,
  removeBook,
  toggleRead,
} from "./books";
import type { NewBook } from "./books";
import { initialBooks } from "./data";

const draft: NewBook = {
  title: "Emma",
  author: "Jane Austen",
  genre: "fantasy",
  rating: 4,
};

describe("addBook", () => {
  test("adds an unread book with trimmed title and author", () => {
    const result = addBook(
      initialBooks,
      { ...draft, title: "  Emma ", author: " Jane Austen  " },
      "new"
    );
    expect(result).toEqual({
      ok: true,
      books: [
        ...initialBooks,
        {
          id: "new",
          title: "Emma",
          author: "Jane Austen",
          genre: "fantasy",
          rating: 4,
          isRead: false,
        },
      ],
    });
  });

  test("does not change the original list", () => {
    const books = structuredClone(initialBooks);
    addBook(books, draft, "new");
    expect(books).toEqual(initialBooks);
  });

  test("rejects a missing title", () => {
    expect(addBook(initialBooks, { ...draft, title: "   " }, "new")).toEqual({
      ok: false,
      error: "Title is required.",
    });
  });

  test("rejects a missing author", () => {
    expect(addBook(initialBooks, { ...draft, author: "" }, "new")).toEqual({
      ok: false,
      error: "Author is required.",
    });
  });

  test("rejects the same title and author regardless of case and spaces", () => {
    const result = addBook(
      initialBooks,
      { ...draft, title: " dune ", author: "FRANK HERBERT" },
      "new"
    );
    expect(result).toEqual({
      ok: false,
      error: "This book is already on your shelf.",
    });
  });

  test("accepts the same title by another author", () => {
    const result = addBook(
      initialBooks,
      { ...draft, title: "Dune", author: "Someone Else" },
      "new"
    );
    expect(result.ok).toBe(true);
  });
});

describe("parseBooks", () => {
  test("returns null when nothing is saved", () => {
    expect(parseBooks(null)).toBeNull();
  });

  test("returns null for invalid JSON", () => {
    expect(parseBooks("not json")).toBeNull();
  });

  test("returns null when the data is not a list", () => {
    expect(parseBooks('{"a":1}')).toBeNull();
  });

  test("returns null when a book is not valid", () => {
    const books = [{ ...initialBooks[0], genre: "romance" }];
    expect(parseBooks(JSON.stringify(books))).toBeNull();
    const rated = [{ ...initialBooks[0], rating: 6 }];
    expect(parseBooks(JSON.stringify(rated))).toBeNull();
  });

  test("returns the saved books", () => {
    expect(parseBooks(JSON.stringify(initialBooks))).toEqual(initialBooks);
  });

  test("accepts an empty shelf", () => {
    expect(parseBooks("[]")).toEqual([]);
  });
});

describe("filterBooks", () => {
  test("filters by genre", () => {
    const result = filterBooks(initialBooks, { genre: "sci-fi", query: "" });
    expect(result.map((book) => book.title)).toEqual(["Dune", "Neuromancer"]);
  });

  test("returns all books for the genre 'all'", () => {
    expect(filterBooks(initialBooks, { genre: "all", query: "" })).toHaveLength(
      5
    );
  });

  test("finds a title regardless of upper and lower case", () => {
    const result = filterBooks(initialBooks, { genre: "all", query: "dune" });
    expect(result.map((book) => book.title)).toEqual(["Dune"]);
  });

  test("ignores spaces around the search text", () => {
    const result = filterBooks(initialBooks, { genre: "all", query: " Dune " });
    expect(result).toHaveLength(1);
  });
});

describe("toggleRead", () => {
  test("toggles the read status of one book", () => {
    const result = toggleRead(structuredClone(initialBooks), "b3");
    expect(result.find((book) => book.id === "b3")?.isRead).toBe(true);
    expect(result.find((book) => book.id === "b1")?.isRead).toBe(true);
  });

  test("does not change the original list", () => {
    const books = structuredClone(initialBooks);
    const result = toggleRead(books, "b3");
    expect(books.find((book) => book.id === "b3")?.isRead).toBe(false);
    expect(result).not.toBe(books);
  });
});

describe("removeBook", () => {
  test("removes the book with the given id", () => {
    const result = removeBook(initialBooks, "b2");
    expect(result.map((book) => book.id)).toEqual(["b1", "b3", "b4", "b5"]);
  });
});

describe("countRead", () => {
  test("counts the read books", () => {
    expect(countRead(initialBooks)).toBe(2);
  });
});

describe("averageRating", () => {
  test("averages only the rated books", () => {
    expect(averageRating(initialBooks)).toBe(4);
  });

  test("returns null when no book is rated", () => {
    expect(averageRating([initialBooks[2], initialBooks[4]])).toBeNull();
  });

  test("returns null for an empty list", () => {
    expect(averageRating([])).toBeNull();
  });
});
