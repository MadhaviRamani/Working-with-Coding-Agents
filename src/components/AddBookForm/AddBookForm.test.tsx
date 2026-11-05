import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddBookForm from ".";

describe("AddBookForm", () => {
  test("has the fields title, author, book genre and rating", () => {
    render(<AddBookForm onAdd={() => null} />);
    expect(screen.getByRole("form", { name: "Add a book" })).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Author")).toBeInTheDocument();
    const genres = within(screen.getByLabelText("Book genre"))
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(genres).toEqual(["Fantasy", "Sci-Fi", "Mystery", "Non-fiction"]);
    const ratings = within(screen.getByLabelText("Rating"))
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(ratings).toEqual(["Not rated", "1", "2", "3", "4", "5"]);
  });

  test("passes the entered book to onAdd and clears the form", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn(() => null);
    render(<AddBookForm onAdd={onAdd} />);
    await user.type(screen.getByLabelText("Title"), "Emma");
    await user.type(screen.getByLabelText("Author"), "Jane Austen");
    await user.selectOptions(screen.getByLabelText("Book genre"), "mystery");
    await user.selectOptions(screen.getByLabelText("Rating"), "3");
    await user.click(screen.getByRole("button", { name: "Add book" }));

    expect(onAdd).toHaveBeenCalledWith({
      title: "Emma",
      author: "Jane Austen",
      genre: "mystery",
      rating: 3,
    });
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Author")).toHaveValue("");
    expect(screen.getByLabelText("Book genre")).toHaveValue("fantasy");
    expect(screen.getByLabelText("Rating")).toHaveValue("0");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("shows the error from onAdd and keeps the entered values", async () => {
    const user = userEvent.setup();
    render(<AddBookForm onAdd={() => "Author is required."} />);
    await user.type(screen.getByLabelText("Title"), "Emma");
    await user.click(screen.getByRole("button", { name: "Add book" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Author is required.");
    expect(screen.getByLabelText("Title")).toHaveValue("Emma");
  });
});
