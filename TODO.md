# Dragon Quest Party Game — MVP Build Order

Stack: React + TypeScript (Vite), Express + TypeScript, Zod, PostgreSQL (or SQLite) + Prisma, Vitest, GitHub Actions.

Core loop: log in as the Party Master -> build a party -> command your members through a short chain of encounters -> collect loot -> spend stat points -> beat the dragon.

## Access model (read this first)

Two layers of access control, one hierarchy:

1. **Party Master** (the player) is the only user role and sits at the top. The master owns the party and the run, and can command every member.
2. **Class roles** (Warrior, Mage, Healer) sit underneath. A member can only do what its class permits: which abilities it can use, which item types it can equip, and the stat caps it can reach.

Every command is checked twice on the server: does this master own this member (ownership), and does this member's class allow it (permission)? The UI hiding a button is never the real check.

## How to use this file

Work top to bottom. Each step depends only on steps above it. Don't start a step until the previous one is tested and working. If a task isn't listed here, it's out of scope.

---

## Step 1 — Project setup

- [ ] Create repo with `client/`, `server/`, `shared/` folders
- [ ] TypeScript strict mode in all three; ESLint + Prettier
- [ ] Add Vitest to `shared/` and `server/`
- [ ] GitHub Actions: install, lint, test on push
- [ ] Pick a project name and a setting that is entirely your own (original names for the world, monsters and dragon)

## Step 2 — Shared types and class permissions

- [ ] In `shared/`, define types: Unit, GameState, Action, Item, Monster, ClassName, Permission
- [ ] Class permissions data file: for each class, the allowed abilities, equippable item types and stat caps
- [ ] Define 2-3 abilities per class (each one belongs to exactly one class)
- [ ] Write `can(member, permission)`: the single function every permission check goes through
- [ ] Tests for `can()`: a Mage cannot use a Warrior ability, a Warrior cannot equip a staff, stat cap enforced
- [ ] Define 5 regular monsters and 1 dragon in a data file (placeholder stats are fine)

## Step 3 — Combat engine (pure TypeScript, no UI, no DB)

- [ ] Put it in `shared/engine/`; no Express, React or Prisma imports
- [ ] Write the seeded RNG function
- [ ] Write `calcDamage`, `checkOutcome` and turn-order logic
- [ ] Write `applyAction(state, action, rng)`: returns a new state, never mutates
- [ ] Support `attack`, `useAbility` and `defend`; `useAbility` calls `can()` and rejects abilities outside the member's class
- [ ] Write simple enemy AI (random living party member)
- [ ] Tests: damage never below 1, defend reduces damage, dead units skipped, same seed gives same result, win/lose detection, wrong actor rejected, forbidden ability rejected
- [ ] Do not move on until these tests pass

## Step 4 — Express server and database

- [ ] Express app with a health route and error-handling middleware
- [ ] Prisma schema and first migration with `User`
- [ ] Zod validation helper for request bodies

## Step 5 — Auth (Party Master)

- [ ] `User { id, email, passwordHash }` (every user is a Party Master; no role field needed)
- [ ] `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- [ ] Hash passwords (argon2 or bcrypt); httpOnly session cookie or JWT
- [ ] `requireAuth` middleware
- [ ] Tests: register, login, wrong password, protected route returns 401 without a session

## Step 6 — Client shell and auth pages

- [ ] React + Vite app with routing
- [ ] Login and register pages
- [ ] Protected route wrapper using `GET /auth/me`
- [ ] Basic layout and a logout button

## Step 7 — Party creation (backend, then frontend)

- [ ] Schema: `Character { id, masterId, name, class, level, statPoints, maxHp, hp, attack, defense, speed }`
- [ ] `POST /party` (3 members), `GET /party`, `DELETE /party`
- [ ] Ownership check: a master only accesses their own members
- [ ] Tests: ownership, invalid class rejected
- [ ] Client: party builder screen (name + class per slot)

## Step 8 — Game run and map (backend)

- [ ] Define the linear map: 6 encounters, last is the dragon (data file)
- [ ] Schema: `GameRun { id, masterId, stateJson, encounterIndex, status }`
- [ ] `POST /run` starts a run from the master's party and the first encounter
- [ ] `GET /run` returns the current run
- [ ] `POST /run/action`: validate, check ownership of the member, load state, call the engine (which checks class permission), save, return new state
- [ ] Server is the only place state changes; the client never sends results
- [ ] On a win: grant stat points to each member, advance `encounterIndex`, partially heal the party, load the next encounter
- [ ] On the dragon's defeat: mark the run `VICTORY`; on a loss: mark `LOST`
- [ ] Tests: cannot command another master's member (403), forbidden ability returns 403, invalid action returns 400, run advances after a win

## Step 9 — Combat UI

- [ ] Combat screen: party panel, enemy panel, action buttons per member, combat log
- [ ] Only show abilities the member's class allows (convenience only; the server enforces it)
- [ ] Disable buttons while a request is in flight; show errors
- [ ] Win screen, lose screen with "try again"
- [ ] Emoji or free art is fine; no animations
- [ ] Manual test: play the full 6 encounters in the browser

## Step 10 — Loot (backend)

- [ ] Schema: `Item { id, name, type, slot, statBonus }`, `InventoryItem { id, masterId, itemId, equippedBy }`
- [ ] Loot table per monster (data file)
- [ ] Roll loot with the seeded RNG after each win and add it to inventory
- [ ] Inventory size limit

## Step 11 — Inventory and equipment

- [ ] `GET /inventory`, `POST /inventory/equip`, `POST /inventory/unequip`
- [ ] Rules: one item per slot, only equip items you own, only on your own members, and only item types the member's class permits (through `can()`)
- [ ] Compute effective stats (base + equipped bonuses) when an encounter starts
- [ ] Tests: slot conflict, ownership, class restriction (Mage cannot equip a greatsword), stat bonuses applied
- [ ] Client: inventory screen with equip/unequip and loot shown after a win

## Step 12 — Stat allocation

- [ ] `POST /party/:memberId/allocate-stats` with `{ attack, defense, speed, hp }` point spends
- [ ] Rules: ownership, enough unspent points, and no stat above the class cap (through `can()`)
- [ ] Tests: overspending rejected, over-cap rejected, another master's member rejected
- [ ] Client: simple allocation screen with +/- buttons between encounters

## Step 13 — Save and resume

- [ ] On login, check for an active run and show "Continue" on the home screen
- [ ] Test: close the browser mid-fight, come back, and continue from the same state

## Step 14 — Seed script

- [ ] Upsert abilities, monsters, items and loot tables (safe to run more than once)
- [ ] Verify a fresh database plus the seed script gives a playable game

## Step 15 — Hardening

- [ ] Rate limit auth routes
- [ ] Secure cookie flags; CORS locked to your client URL
- [ ] Review every route for ownership checks and every command for class-permission checks
- [ ] Loading, error and empty states everywhere
- [ ] Mobile-friendly layout

## Step 16 — Deploy

- [ ] Deploy server and database (Render or Fly.io); set environment variables
- [ ] Run migrations and the seed script on production
- [ ] Deploy client (Vercel or Netlify) pointed at the server URL
- [ ] Play through the whole game on the live site, on a phone

## Step 17 — README and portfolio

- [ ] Screenshot or GIF at the top, then the live link
- [ ] Stack, how to run locally, how to run tests
- [ ] "Design decisions" section: Party Master > class roles hierarchy, a single `can()` permission function, server-authoritative state, pure engine, seeded RNG
- [ ] Add a demo account or a "try as guest" option
- [ ] Pin the repo on GitHub with a one-line description

---

## Out of scope (do not build for the MVP)

- An admin role or content editor (content lives in data files and the seed script)
- Real-time or multiplayer features
- Procedural maps or branching paths
- Animations, sound, or custom art
- More than 3 classes, or a large item catalog
- Crafting, shops, quests, skill trees
- Password reset email flow, OAuth

## Done means

- Live URL works from a phone
- A new player can register, build a party, beat the dragon, and see loot
- Class restrictions are enforced by the server and covered by tests
- Engine tests pass in CI
- README explains the project in under two minutes of reading
