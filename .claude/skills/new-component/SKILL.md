---
name: new-component
description: Scaffold a new React component following the project conventions (folder, props type, colocated test). Takes the component name followed by its purpose, e.g. /new-component EmptyShelf shows a message when no book matches. Use when the user runs /new-component or asks to create a new component.
argument-hint: <ComponentName> <purpose>
---

# New component

Arguments: `$ARGUMENTS`

The first word is the component name (PascalCase). Everything after it is the purpose: what the component should do. If the name is missing, not PascalCase, or `src/components/<Name>/` already exists, stop and ask the user. If the purpose is missing, ask for it.

## Files to create

1. `src/components/<Name>/index.tsx`
   - A default-exported function component: `export default function <Name>(...)`.
   - A `type <Name>Props = { ... }` for its props, declared above the component. Only add the props the purpose needs.
   - Presentational only: no `useState` for app data. Data and callbacks come in as props, because `src/App.tsx` owns all state.
   - Use `import type` for type-only imports, such as `import type { Book } from "../../types";`.
   - Any non-UI logic goes in `src/books.ts` as a pure function, tested in `src/books.test.ts`, not in the component.
   - Use accessible markup (semantic elements, labels, `aria-label` where needed) so tests can query by role or label.

2. `src/components/<Name>/<Name>.test.tsx`
   - `import { describe, expect, test } from "vitest";` (add `vi` only if needed). No globals. Use `test`, not `it`.
   - `import { render, screen } from "@testing-library/react";` and `import <Name> from ".";`
   - For interactions, use `userEvent.setup()` from `@testing-library/user-event`.
   - Wrap the tests in `describe("<Name>", ...)`. Cover the behavior in the purpose, and query by role, label or text rather than by class or test id.

Model the files on an existing component, such as `src/components/AddBookForm/`.

## Do not

- Wire the component into `App.tsx` unless the user asks. Say where it would plug in instead.
- Add dependencies or edit `src/data.ts`.

## Finish

Run `npm run check` and `npm run test:run` (never `npm test`). Report the files you created and both results.
