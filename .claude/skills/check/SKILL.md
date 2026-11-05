---
name: check
description: Verify a change before calling it done by running the type check (npm run check) and all tests once (npm run test:run), then report the results. Use when the user runs /check, asks to verify, check or test the project, or before saying a change is finished.
---

# Check

Run both checks from the project root. Run them in this order, and run the second even if the first fails:

1. `npm run check` — TypeScript type check (`tsc --noEmit`).
2. `npm run test:run` — all Vitest tests, once.

Never run `npm test`: it starts watch mode and never exits.

## Report

- Both pass: one line each, e.g. `check: passed` and `tests: 41 passed (3 files)`.
- Something fails: show the failing type errors (file:line and message) or the failing test names with their assertion output. Keep the relevant output, not the whole log.
- Do not fix anything unless the user asks. Never change a test to make it pass unless the requirement changed.
