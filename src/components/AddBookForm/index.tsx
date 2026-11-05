import { useState } from "react";
import type { FormEvent } from "react";
import type { NewBook } from "../../books";
import type { Genre } from "../../types";

type AddBookFormProps = {
  /** Returns an error message, or `null` when the book was added. */
  onAdd: (draft: NewBook) => string | null;
};

const emptyDraft: NewBook = {
  title: "",
  author: "",
  genre: "fantasy",
  rating: 0,
};

export default function AddBookForm({ onAdd }: AddBookFormProps) {
  const [draft, setDraft] = useState<NewBook>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onAdd(draft);
    setError(result);
    if (result === null) {
      setDraft(emptyDraft);
    }
  }

  return (
    <form
      className="add-book"
      aria-labelledby="add-book-heading"
      onSubmit={handleSubmit}
    >
      <h2 id="add-book-heading">Add a book</h2>
      <label>
        Title
        <input
          type="text"
          aria-required="true"
          value={draft.title}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
        />
      </label>
      <label>
        Author
        <input
          type="text"
          aria-required="true"
          value={draft.author}
          onChange={(event) =>
            setDraft({ ...draft, author: event.target.value })
          }
        />
      </label>
      <label>
        Book genre
        <select
          value={draft.genre}
          onChange={(event) =>
            setDraft({ ...draft, genre: event.target.value as Genre })
          }
        >
          <option value="fantasy">Fantasy</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="mystery">Mystery</option>
          <option value="non-fiction">Non-fiction</option>
        </select>
      </label>
      <label>
        Rating
        <select
          value={draft.rating}
          onChange={(event) =>
            setDraft({ ...draft, rating: Number(event.target.value) })
          }
        >
          <option value={0}>Not rated</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </label>
      <button type="submit">Add book</button>
      {error !== null && <p role="alert">{error}</p>}
    </form>
  );
}
