# Agent Guide

`CLAUDE.md` is a symlink to this file.

## Docs

- [README.md](./README.md) — run/build/test commands, feature docs
- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, routing, data flow, deployment
- [DESIGN.md](./DESIGN.md) — tokens, theming, component pattern
- [PRODUCT.md](./PRODUCT.md) — what this is; replace for a real product

## Before finishing a change

```bash
npm run verify   # lint + typecheck + test + test:e2e
```

Individually: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run test:smoke`.

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
