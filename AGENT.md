# Agent Guide

`CLAUDE.md` is a symlink to this file.

## Docs

- [README.md](./README.md) — run/build/test commands, feature docs
- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, routing, data flow, deployment
- [DESIGN.md](./DESIGN.md) — tokens, theming, component pattern
- [PRODUCT.md](./PRODUCT.md) — what this is; replace for a real product

## Before finishing a change

```bash
bun run verify   # lint + typecheck + test — safe everywhere, including browserless containers
```

`verify` deliberately does NOT include E2E. Playwright needs an installed
Chromium; engineer/agent workspace containers don't have one, and E2E belongs
to the QA phase (browser-equipped container) and CI. Where a browser exists,
use `bun run verify:full` (verify + test:e2e). Every Playwright script
(`test:e2e`, `e2e`, `test:smoke`) has a preflight that fails fast with a clear
message when the browser is missing — if you hit it, run `bun run verify` and
move on; do NOT retry E2E or try to install a browser.

Individually: `bun run lint`, `bun run typecheck`, `bun run test`, `bun run test:e2e`, `bun run test:smoke`.

## Adding tests

| You changed...                            | Add...                                      | Copy from                           |
| ----------------------------------------- | ------------------------------------------- | ----------------------------------- |
| A util (`src/utils`)                      | Unit test, `<name>.test.ts`                 | `src/utils/cn.test.ts`              |
| A component                               | UI test, `<name>.test.tsx`                  | `src/components/ui/button.test.tsx` |
| A page                                    | UI test, `<name>.test.tsx`                  | `src/pages/index.test.tsx`          |
| An API route/middleware                   | Integration test, real `H3Event`, no server | `routes/api/hello.test.ts`          |
| A cross-page/responsive/browser-only flow | Playwright spec in `e2e/`                   | `e2e/home.spec.ts`                  |

## Gotchas

- Nitro's `serverDir` defaults to `false` — must be `"./"` in `vite.config.ts` or `routes/`/`middleware/` never load
- `Pages()` needs `exclude: ["**/*.test.tsx"]` or the build breaks on the first page test
- `nitro()` needs `ignore: ["**/*.test.ts"]` or route tests get bundled into the prod server
- `auto-imports.d.ts` doesn't exist on a fresh clone — `pretypecheck`/`prebuild` generate it; give any new `tsc`-only script the same hook
- Playwright runs on port 5178, not 5000, so it never collides with a dev server
- `tsconfig.node.json` is `composite: true` — can't set `noEmit`, so it has its own `outDir` to avoid scattering compiled files
- `db/client.ts` resolves `sqlite.db` and the `drizzle/` migrations folder from `process.cwd()`, not `import.meta.url` — Vite/Nitro/Vitest all transform this module, so its `import.meta.url` isn't a real `file://` URL
- Under Vitest (`VITEST=true`), `db/client.ts` uses an in-memory db instead of `sqlite.db`, so route tests never touch or share the dev database
- `db/client.ts` imports `bun:sqlite` (a Bun builtin), so anything that loads it must run under Bun. Two consequences: (1) `vitest.config.ts` splits into a `client` project (jsdom, everything except `routes/**`) and a `server` project (`environment: "node"`, `routes/**/*.test.ts`) — Vite's jsdom/"client" environment can't externalize a runtime builtin at all (browsers have no such module to resolve against), only a server-like environment can; (2) `test`/`test:watch` run `bun --bun vitest` (not plain `vitest`) — Vitest's worker pool otherwise spawns real Node child processes even when the parent script itself ran under `bun run`, and Node has no `bun:sqlite` either. `.output/server/index.mjs` (PM2/systemd, see ARCHITECTURE.md#deployment) needs the same Bun requirement in production
