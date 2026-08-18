# AGENTS.md

Guidance for AI coding agents working in this repo.

## Never create a local `.pnpm-store`

**Do not create, configure, or use a `.pnpm-store` (or any store path) inside this repository.** That is a recurring annoyance in this project.

- Always use the default **user-level** pnpm store (outside the repo).
- Never pass `--store-dir` / `store-dir` pointing into the workspace.
- Never add a repo-local store via `.npmrc`, env vars, or install scripts.
- If a repo-local `.pnpm-store` appears, **delete it immediately**.

## Layout

pnpm monorepo (Node `>=22`, packageManager `pnpm@11.1.3`):

| Package | Role |
| --- | --- |
| `client/` | React 19 + Vite + MUI SPA |
| `server/` | Express 5 + Socket.IO API |
| `shared/` | Types, game rules helpers, i18n language list — used by client and server |

Install and run from each package directory (`cd client` / `cd server` / `cd shared`). Prefer `pnpm` only (`only-allow pnpm` on preinstall).

## Commands

```sh
# server
cd server && pnpm i && pnpm dev
cd server && pnpm test          # vitest; server must be up for integration tests
cd server && pnpm lint && pnpm typecheck

# client
cd client && pnpm i && pnpm start
cd client && pnpm test          # vitest unit tests
cd client && pnpm lint && pnpm typecheck

# Cypress (binary is NOT installed on pnpm install)
cd client && pnpm cypress install
cd client && pnpm cypress open  # or CI: pnpm cypress run
```

Build shared before client typecheck/start when needed: `pnpm build-shared` (via client scripts) or `pnpm --prefix shared build`.

## Hard constraints

- **Do not enable Cypress `allowBuilds` / postinstall.** Keep `cypress: false` in `client/pnpm-workspace.yaml`. Install the binary on demand with `pnpm cypress install` (CI already does this).
- **Keep client/server on TypeScript 6.x** while they use `typescript-eslint`. TS 7 has no programmatic API yet; eslint support waits on TS 7.1+. `shared` may use TS 7 (CLI-only).
- **Do not commit** unless the user asks. Do not force-push `main`/`master`.

## Architecture notes

- Real-time play is Socket.IO-first; HTTPS REST is the fallback for the same player actions.
- Game mutations are **server-authoritative**. Shared helpers like `canPlayerChooseAction*` gate UI and AI; the server re-validates inside handlers and throws `GameMutationInputError` subclasses (e.g. `ActionNotCurrentlyAllowedError`).
- Client mutations go through `useGameMutation` → `socket.emit` / HTTP. `PlayerActionConfirmation` auto-submits when confirm-actions is off — submit **once per mount** (avoid effect re-fires on unstable `variables`/`trigger` identities).
- Put cross-cutting game rules in `shared/`; keep Express thin and logic in `server/src/game/`.

## i18n

New languages:

1. `shared/i18n/availableLanguages.ts`
2. `client/src/i18n/translations.ts`
3. `server/src/i18n/translations.ts`

## Style

- Match existing patterns; small, focused diffs.
- Do not add drive-by refactors, extra docs, or unsolicited dependency upgrades.
- Prefer shared logic over duplicating client/server checks.
