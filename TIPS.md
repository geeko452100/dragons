# Pseudocode Tips

Pseudocode only. Translate to TypeScript yourself so you understand each piece.

Access model: the Party Master (the player) is the only user role and owns everything. Class roles (Warrior, Mage, Healer) sit underneath and limit what each party member can do.

---

## 1. Shared types (shared/)

```
type ClassName = WARRIOR | MAGE | HEALER

type Permission =
  | { kind: USE_ABILITY, abilityId }
  | { kind: EQUIP_TYPE,  itemType }
  | { kind: STAT_VALUE,  stat, value }

type Unit {
  id, name, side (PARTY | ENEMY)
  class (party members only)
  hp, maxHp, attack, defense, speed
  defending: boolean
}

type GameState {
  units: Unit[]
  turnOrder: unitId[]
  turnIndex: number
  log: string[]
  status: ONGOING | WON | LOST
  rngState: number
}

type Action =
  | { type: ATTACK,  actorId, targetId }
  | { type: ABILITY, actorId, abilityId, targetId }
  | { type: DEFEND,  actorId }
```

---

## 2. Class permissions and the single `can()` function

```
CLASS_PERMISSIONS = {
  WARRIOR: {
    abilities: [POWER_STRIKE, SHIELD_BASH],
    equipTypes: [SWORD, SHIELD, HEAVY_ARMOR],
    statCaps:  { hp: 60, attack: 30, defense: 30, speed: 12 }
  },
  MAGE: {
    abilities: [FIREBALL, FROST_BOLT],
    equipTypes: [STAFF, ROBE],
    statCaps:  { hp: 35, attack: 35, defense: 12, speed: 16 }
  },
  HEALER: {
    abilities: [HEAL, BLESSING],
    equipTypes: [STAFF, ROBE, LIGHT_SHIELD],
    statCaps:  { hp: 45, attack: 15, defense: 20, speed: 14 }
  }
}

function can(member, permission):
    rules = CLASS_PERMISSIONS[member.class]
    switch permission.kind:
        USE_ABILITY: return permission.abilityId in rules.abilities
        EQUIP_TYPE:  return permission.itemType in rules.equipTypes
        STAT_VALUE:  return permission.value <= rules.statCaps[permission.stat]
```

Every check goes through this one function: the engine for abilities, the inventory code for equipment, the stat-allocation code for caps. If a rule changes, you change it in one place.

Write this and its tests (Step 2) before anything else that uses it.

---

## 3. Seeded RNG

```
function createRng(seed):
    state = seed
    return function next():
        // any small deterministic algorithm, e.g. mulberry32
        state = update(state)
        return number between 0 and 1
```

Same seed plus same actions gives the same fight, so tests are exact instead of flaky. Store the RNG state in GameState so a saved run continues correctly.

---

## 4. Combat engine (pure function)

```
function applyAction(state, action, rng):
    state = deepCopy(state)              // never mutate the input

    actor = findUnit(state, action.actorId)

    if state.status != ONGOING:           return error("fight is over")
    if actor is dead:                     return error("actor is dead")
    if currentTurnUnit(state) != actor:   return error("not your turn")

    switch action.type:
        ATTACK:
            target = findLivingUnit(state, action.targetId)
            dmg = calcDamage(actor, target, rng)
            target.hp = max(0, target.hp - dmg)
            log("actor hits target for dmg")

        ABILITY:
            if not can(actor, { kind: USE_ABILITY, abilityId: action.abilityId }):
                return error(FORBIDDEN, "class cannot use this ability")
            ability = ABILITIES[action.abilityId]
            target = findUnit(state, action.targetId)
            ability.apply(actor, target, state, rng)

        DEFEND:
            actor.defending = true

    state.status = checkOutcome(state)
    if state.status == ONGOING:
        advanceTurn(state)               // skip dead units
        while currentTurnUnit(state).side == ENEMY and state.status == ONGOING:
            runEnemyTurn(state, rng)
            state.status = checkOutcome(state)
            advanceTurn(state)

    return state


function calcDamage(attacker, target, rng):
    base = attacker.attack
    variance = 0.85 + rng() * 0.3         // 85%-115%
    raw = base * variance
    reduced = raw - target.defense
    if target.defending: reduced = reduced / 2
    return max(1, round(reduced))         // always at least 1


function runEnemyTurn(state, rng):
    enemy = currentTurnUnit(state)
    enemy.defending = false
    targets = living party units
    target = targets[floor(rng() * length(targets))]
    dmg = calcDamage(enemy, target, rng)
    target.hp = max(0, target.hp - dmg)
    log(...)


function checkOutcome(state):
    if no living ENEMY units: return WON
    if no living PARTY units: return LOST
    return ONGOING
```

Tests to write first: damage never below 1, defend halves damage, dead units are skipped, same seed gives same log, WON/LOST detected, wrong actor rejected, forbidden ability rejected (Mage using POWER_STRIKE).

---

## 5. Auth (Party Master only)

```
function requireAuth(req, res, next):
    session = readSessionFromCookie(req)
    if not session: return res.status(401)
    req.master = loadUser(session.userId)
    next()

POST /auth/register
    body = validate(body, { email, password (min length) })
    if emailExists(body.email): return 409
    hash = hashPassword(body.password)
    master = createUser(email, hash)
    startSession(master)
```

There is no admin role, so there's no role middleware. Authorization is ownership plus class permissions.

Ownership helper:

```
function loadOwnedMember(masterId, memberId):
    member = findMember(memberId)
    if not member or member.masterId != masterId: return 403
    return member
```

---

## 6. Server-authoritative action endpoint

```
POST /run/action          // requireAuth
    action = validate(body, ActionSchema)             // Zod
    run = findRunByMasterId(req.master.id)            // only their own run
    if not run: return 404

    // ownership: the acting member must belong to this master
    loadOwnedMember(req.master.id, action.actorId)    // 403 if not

    state = parse(run.stateJson)
    rng = createRng(state.rngState)

    result = applyAction(state, action, rng)          // engine checks class permission
    if result is error:
        return result.code == FORBIDDEN ? 403 : 400

    newState = result
    newState.rngState = rng.currentState()

    if newState.status == WON:
        newState = finishEncounter(run, newState)
    if newState.status == LOST:
        markRunLost(run)

    save(run, newState)
    return newState
```

Rule: the client sends what it wants to do. The server decides what happened.

---

## 7. Encounter progression, loot and stat points

```
function finishEncounter(run, state):
    encounter = MAP[run.encounterIndex]
    drops = rollLoot(encounter.lootTable, rng)
    addToInventory(run.masterId, drops)

    for member in party members:
        member.statPoints += POINTS_PER_WIN      // e.g. 2

    if run.encounterIndex is last:               // the dragon
        run.status = VICTORY
        return state

    run.encounterIndex += 1
    healPartyPartially(state)                    // e.g. restore 30% max HP
    state = loadEncounter(MAP[run.encounterIndex], state.party)
    return state


function rollLoot(lootTable, rng):
    drops = []
    for entry in lootTable:                      // { itemId, chance }
        if rng() < entry.chance:
            drops.push(entry.itemId)
    return drops
```

---

## 8. Inventory and equipment

```
POST /inventory/equip       // requireAuth
    { inventoryItemId, memberId } = validate(body)

    item = findInventoryItem(inventoryItemId)
    if item.masterId != req.master.id: return 403
    member = loadOwnedMember(req.master.id, memberId)

    if not can(member, { kind: EQUIP_TYPE, itemType: item.type }):
        return 403 "this class cannot equip that"

    existing = equippedItemInSlot(member, item.slot)
    transaction:
        if existing: existing.equippedBy = null
        item.equippedBy = member.id


function effectiveStats(member, equippedItems):
    stats = copy(member.baseStats)
    for item in equippedItems:
        stats.attack  += item.bonus.attack
        stats.defense += item.bonus.defense
        // ...
    return stats
```

Compute effective stats when an encounter starts so the engine only sees final numbers.

Inventory limit:

```
if countInventory(masterId) >= MAX_INVENTORY: return 400 "inventory full"
```

---

## 9. Stat allocation

```
POST /party/:memberId/allocate-stats      // requireAuth
    spend = validate(body, { hp, attack, defense, speed })   // each >= 0 integers
    member = loadOwnedMember(req.master.id, params.memberId)

    total = sum(spend)
    if total > member.statPoints: return 400 "not enough points"

    for stat in spend:
        newValue = member[stat] + spend[stat]
        if not can(member, { kind: STAT_VALUE, stat, value: newValue }):
            return 403 "class cap reached for stat"

    transaction:
        apply each spend to member
        member.statPoints -= total
```

---

## 10. Seed script

```
function seed():
    upsert abilities, monsters, items, loot tables
```

Use upserts so you can run it more than once safely. There's no admin user to seed.

---

## 11. Client structure (React)

```
pages/
    Login, Register
    PartyBuilder
    Run            // combat screen
    Inventory
    StatAllocation

hooks/
    useRun()           // GET /run
    useAction()        // POST /run/action; on success, update the cached run

Run page:
    run = useRun()
    if loading: show spinner
    if run.status == LOST: show defeat screen
    if run.status == VICTORY: show win screen

    show party, enemies, log
    for each living party member whose turn it is:
        show buttons only for abilities their class allows   // convenience only
    onClick(button): action.mutate({ type, actorId, targetId })
        // buttons disabled while mutation is pending
        // if the server returns 403, show the message
```

The client holds no game rules. The UI hides forbidden buttons to be friendly, but the server is what actually refuses them. If you find yourself computing damage in React, move it to the engine.

---

## Order of work reminder

Class permissions and `can()` first, then the engine and tests, then the API around it, then the UI. If those two are solid, everything else is plumbing.
