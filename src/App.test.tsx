import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { initialBooks } from "./data";

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  author: string
) {
  if (title) await user.type(screen.getByLabelText("Title"), title);
  if (author) await user.type(screen.getByLabelText("Author"), author);
  await user.click(screen.getByRole("button", { name: "Add book" }));
}

function titles() {
  return screen
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);
}

describe("Adding a book", () => {
  test("adds an unread book to the list and the read count", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit(user, "  Emma  ", " Jane Austen ");

    expect(titles()).toEqual([...initialBooks.map((b) => b.title), "Emma"]);
    expect(
      screen.getByRole("button", { name: "Mark Emma as read" })
    ).toBeInTheDocument();
    expect(screen.getByText(/2 of 6 read/)).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Author")).toHaveValue("");
  });

  test("shows an error and adds nothing when the title is missing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit(user, "   ", "Jane Austen");

    expect(screen.getByRole("alert")).toHaveTextContent("Title is required.");
    expect(titles()).toHaveLength(5);
  });

  test("shows an error and adds nothing when the author is missing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit(user, "Emma", "");

    expect(screen.getByRole("alert")).toHaveTextContent("Author is required.");
    expect(titles()).toHaveLength(5);
  });

  test("rejects a book that is already on the shelf", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit(user, " dune ", "frank herbert");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This book is already on your shelf."
    );
    expect(titles()).toHaveLength(5);
  });

  test("accepts the same title by another author", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit(user, "Dune", "Someone Else");

    expect(screen.queryByRole("alert")).toBeNull();
    expect(titles()).toEqual([...initialBooks.map((b) => b.title), "Dune"]);
  });
});

describe("Saving the books", () => {
  test("saves the books in localStorage", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillAndSubmit(user, "Emma", "Jane Austen");

    const saved = JSON.parse(localStorage.getItem("bookshelf:books") ?? "[]");
    expect(saved).toHaveLength(6);
    expect(saved[5]).toMatchObject({
      title: "Emma",
      author: "Jane Austen",
      isRead: false,
    });
  });

  test("loads the saved books when the app starts", () => {
    localStorage.setItem(
      "bookshelf:books",
      JSON.stringify([{ ...initialBooks[0], id: "x", title: "Saved Book" }])
    );
    render(<App />);
    expect(titles()).toEqual(["Saved Book"]);
  });

  test.each(["not json", '{"a":1}', '[{"title":"Broken"}]'])(
    "shows the sample books when the saved data is not valid: %s",
    (raw) => {
      localStorage.setItem("bookshelf:books", raw);
      render(<App />);
      expect(titles()).toEqual(initialBooks.map((b) => b.title));
    }
  );
});

describe("App", () => {
  test("renders all books", () => {
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  test("shows only the books of the selected genre", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Genre"), "sci-fi");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  test("marks a book as read", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Mark Gone Girl as read" })
    );
    expect(
      screen.getByRole("button", { name: "Mark Gone Girl as unread" })
    ).toBeInTheDocument();
    expect(screen.getByText(/3 of 5 read/)).toBeInTheDocument();
  });

  test("removes the right book while a genre filter is active", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Genre"), "sci-fi");
    await user.click(
      screen.getByRole("button", { name: "Remove Neuromancer" })
    );
    await user.selectOptions(screen.getByLabelText("Genre"), "all");
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles).toEqual(["Dune", "The Hobbit", "Gone Girl", "Sapiens"]);
  });

  test("shows 'Average rating: 4' for the sample books", () => {
    render(<App />);
    const stats = screen.getByText(/Average rating/);
    expect(within(stats).queryByText("NaN")).toBeNull();
    expect(stats).toHaveTextContent("Average rating: 4");
  });
});
