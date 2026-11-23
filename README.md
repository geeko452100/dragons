# Dragons

A turn-based party game. Log in as the Party Master, build a party of three, command them through six encounters, collect loot, spend stat points, and beat the dragon.

> Work in progress. Project setup is done; building the shared types and class permissions next.

<!-- TODO: screenshot or GIF here, then the live link -->

## Stack

- **Client:** React + TypeScript (Vite)
- **Server:** Express + TypeScript, Zod
- **Database:** PostgreSQL or SQLite via Prisma
- **Tests:** Vitest
- **CI:** GitHub Actions

## Project layout

```
client/   React app
server/   Express API
shared/   Types, class permissions, combat engine (used by both)
```

## Running locally

Requires Node 20+.

```
npm install
npm run dev -w @fantasy/client   # client dev server
```

The server has no runnable entry point yet.

## Scripts

| Command                | What it does                      |
| ---------------------- | --------------------------------- |
| `npm test`             | Run Vitest in all workspaces      |
| `npm run lint`         | ESLint                            |
| `npm run format`       | Prettier (write)                  |
| `npm run format:check` | Prettier (check only, used in CI) |
| `npm run typecheck`    | `tsc` in all workspaces           |

## Design decisions

Planned; to be expanded as each is built.

- **Party Master > class roles.** The player is the only user role and owns the party. Class roles (Warrior, Mage, Healer) limit what each member can do.
- **One `can()` function.** Every class permission check (abilities, equipment, stat caps) goes through a single function.
- **Server-authoritative state.** The client sends intent; the server decides what happened.
- **Pure combat engine.** No Express, React or database imports, so it's easy to test.
- **Seeded RNG.** Same seed plus same actions gives the same fight, so tests are exact.
