# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Bookshelf: a small client-only React 19 + TypeScript (strict) app built with Vite 5. Tests use Vitest 2 + Testing Library in jsdom. No router, no state library, no backend. Node.js 22.22+.

## Commands

- `npm run test:run` — run all tests once. **Always use this.** `npm test` starts watch mode and never exits — do not run it.
- `npx vitest run src/books.test.ts` — run a single test file; add `-t "test name"` to run a single test.
- `npm run check` — type check (`tsc --noEmit`).
- `npm run build` — production build.
- `npm run dev` — dev server on port 3000 (opens a browser).

Before calling a change done, `npm run check` and `npm run test:run` must both pass.

## Architecture

- `src/App.tsx` owns all state (`books`, `genre`, `query`) with `useState` and passes data and callbacks down. Components are presentational.
- `src/books.ts` holds all non-UI logic as pure functions (`filterBooks`, `toggleRead`, `removeBook`, `countRead`, `averageRating`); `App` calls them and passes the result to `setBooks`.
- `src/types.ts` defines `Book`, `Genre` (`fantasy | sci-fi | mystery | non-fiction`) and `GenreFilter`. `rating` is 0–5, where 0 means "not rated".
- `src/data.ts` exports `initialBooks`, the 5 sample books. Tests rely on these exact books (counts, titles, read state).
- `src/App.test.tsx` contains integration tests that render `<App />` and query by role/label text. Button labels like `Mark <title> as read` and `Remove <title>` are part of what tests query against.

## Conventions

- Components live in `src/components/<Name>/index.tsx` as a default export, with a `type <Name>Props` for the props and the test in `src/components/<Name>/<Name>.test.tsx` next to it.
- Logic that is not UI lives in `src/books.ts` and is tested in `src/books.test.ts`.
- State is never mutated in place: functions return new arrays/objects (`map`, `filter`, spread).
- Tests import `describe`/`test`/`expect` from `vitest` explicitly (no globals). Use `test`, not `it`. Prefer Testing Library role/label queries and `userEvent.setup()`.
- Use `import type` for type-only imports.

## Off limits

- Do not add dependencies without asking.
- Do not edit `src/data.ts`.
- Never change a test to make it pass, unless the requirement changed.
