# Beer list: several drinks

Florian, 2026-11-15: "we don't only have beer". The list owner keeps stock of several **drinks**
(e.g. Veltins, Oberdorfer Helles, Radler); the forecast runs per drink; a member picks the drink,
the count and books. Still **whole crates only** (re-asked 2026-11-15). Reverses the 2026-11-04
"one item, one price" ruling (CONTEXT *Beer list*, ADR-0035 "One item").

## Rulings (decided 2026-11-15, senior-dev calls)

- **Drink** = a kind of crate on the beer list: a name and, per pot, a crate price. Drinks form a
  club-wide catalogue (`BeerDrink`: id, name; name unique case-insensitively, ≤ 40 chars) so a
  drink keeps its identity across handovers — the forecast pace per drink carries over, as the
  pot-wide pace did. A pot **lists** drinks (`BeerPotDrink`: pot, drink, crate price, retired at,
  stock warning sent at; unique per pot+drink).
- Adding a drink by a name the catalogue already knows (case-insensitive) reuses that drink; adding
  a drink the pot retired un-retires it with the new price. Renaming changes the catalogue name
  (typo fixes reach history); a rename onto another catalogue drink's name is a 409.
- A drink can be **retired** from a pot only at zero stock (409 otherwise). Retired drinks are not
  bookable, not listed to members, not carried on handover; their history stays.
- Each crate and each stock movement names its drink. A crate keeps the price it had when taken.
- **Stock** and **forecast** are per drink: stock = movements − taken crates of that pot+drink;
  pace = crates of that drink taken (any pot) in the last 21 days. Stock never below zero per
  drink. Booking more crates than that drink has → 409.
- **Stock warning** is armed per pot drink; a delivery of that drink re-arms it; one push per run
  names every due drink (soonest first). Handover carries each drink's warning state.
- **Opening a pot** needs ≥ 1 drink (name + price). **Settings** keep only the PayPal link; prices
  live on the drinks.
- **Handover** carries every non-retired drink with its stock; the successor sets a price per
  carried drink — the request must price exactly the old pot's non-retired drinks.
- **Payments** unchanged: settle the person's oldest open crates, any drink; amount = their prices.
- **Members** see each listed drink's name, price and whether it has stock (never the count).
- **Default drink** (Florian, 2026-11-15, round 2): an operator marks at most one listed drink of the
  pot as default (`BeerPotDrink.IsDefault`, filtered unique per pot); the booking page preselects it
  when it has stock (else: the only drink in stock, else nothing). Opening a pot makes the first
  drink of the request the default. Retiring the default clears it. A handover carries the default
  when that drink is carried. Migration: every backfilled "Bier" is its pot's default.
- Migration: every existing pot gets the drink "Bier" at its old crate price; all crates and
  movements point at it; the pot's stock-warning state moves onto that pot drink.

## API contract (camelCase JSON)

Round 2 additions:
- `GET beer-list/pot` drinks and `GET …/stock` drinks add `isDefault`.
- New `POST beer-list/pots/{beerPotId}/drinks/{beerDrinkId}/default` → 204; makes that drink the
  pot's default and clears the previous one; 409 for a retired drink or a handed-over pot; 404 for
  a drink the pot doesn't list.

Changed:
- `GET beer-list/pot` → `pot: { beerPotId, owner, paymentLink, openedAt, drinks: [{ beerDrinkId,
  name, cratePriceCents, hasStock }] } | null` (drop `cratePriceCents`, `hasStock`; drinks =
  non-retired, ordered by name, German collation).
- `POST beer-list/crates` body `{ beerDrinkId, count }` (response unchanged).
- `POST beer-list/pots/{beerPotId}/crates` body adds `beerDrinkId`.
- `POST beer-list/pots` body `{ ownerPersonId, paymentLink?, drinks: [{ name, cratePriceCents }] }`
  (1–12 drinks, distinct names case-insensitive).
- `PUT beer-list/pots/{beerPotId}` body `{ paymentLink? }`.
- `POST beer-list/pots/{beerPotId}/deliveries` and `/stock-corrections` bodies add `beerDrinkId`.
- `GET beer-list/pots/{beerPotId}/stock` → `{ drinks: [{ beerDrinkId, name, cratePriceCents,
  isRetired, crates, forecast: { paceWindowDays, cratesTakenInPaceWindow, projectedEmptyOn } }],
  movements: [{ …as today, beerDrinkId, drinkName }] }` (drinks: listed first by name, retired
  last).
- `POST beer-list/pots/{beerPotId}/handover` body `{ successorPersonId, paymentLink?, drinks:
  [{ beerDrinkId, cratePriceCents }] }`; response `{ beerPotId, carriedCrates }` (total).
- `GET beer-list/tab` crate summaries add `beerDrinkId, drinkName`.
- `GET beer-list/pots/{beerPotId}/journal` crates add `beerDrinkId, drinkName`.
- `GET beer-list/givers` entries add `drinks: [{ beerDrinkId, name, crates }]` (keep total `crates`).
- `GET beer-list/pots` summaries drop `cratePriceCents`.
- Start operator desk tile (stock/forecast) → per drink: the drink running out soonest drives it.

New:
- `POST beer-list/pots/{beerPotId}/drinks` `{ name, cratePriceCents }` → `{ beerDrinkId }`.
- `PUT beer-list/pots/{beerPotId}/drinks/{beerDrinkId}` `{ name, cratePriceCents }` → 204.
- `POST beer-list/pots/{beerPotId}/drinks/{beerDrinkId}/retire` → 204.

All drink writes: `beer_list.manage`, open pot only (409 on a handed-over pot), price rule as the
old crate price (`CratePrice()`), unknown drink on the pot → 404.

## UI (club app) — round 2 (supersedes the round-1 stock pane layout)

- Drinks are configured in **Settings** (new tab "Getränke" next to PayPal/Teilnahmen/Code/
  Übergabe, its own child route): list of drinks with price + stock, add, edit name/price, retire
  (at zero stock), mark as default ("Standard").
- The **Bestand** action pane only books stock: pick the drink (chips), amount ± (delivery adds,
  correction takes out), book. No per-drink stock route anymore.
- The hub's **forecast** shows one line per drink (chart series + one "reicht bis" row per drink),
  so the operator always sees which drink runs out when.
- Booking page preselects the default drink (when in stock).

## UI (club app) — round 1

- Booking (pallet page `/beer-list/book` and the in-app beer list): pick the drink (sold-out
  drinks visible but disabled; a single drink is preselected), pick the count, book. Undo as today.
- Manage › Bestand: one block per drink — stock, forecast, delivery / correction; add a drink,
  edit name + price, retire (only at zero). Movements show the drink.
- Manage › open pot form: drink rows (name + price). Settings: PayPal link only.
- Manage › Kisten (book for a person): drink picker. Handover: a price per carried drink.
- Tab, journal, start sheet: each crate line names its drink. Givers: per-drink counts.

## Round 3 — payments per drink (Florian, 2026-11-15)

The manager books a payment by picking, **per drink**, how many crates the person paid — fastest
possible input (one stepper per drink with that person's open crates of it, an "Alles" chip that
selects every open crate, the sum live). A money input was considered and rejected.

- `POST beer-list/pots/{beerPotId}/payments` body becomes `{ personId, drinks: [{ beerDrinkId,
  crates }] }` (1+ entries, distinct drinks, crates ≥ 1, total ≤ `BeerPayment.MaxCrates`); it
  settles that person's **oldest open crates of each named drink** in that pot; asking more crates of
  a drink than are open → 409 (as today's "more than open"). Response unchanged
  (`beerPaymentId, crates, amountCents`). One payment row still records total crates + amount; the
  journal/tab payment summaries may add `drinks: [{ beerDrinkId, name, crates }]` derived from the
  settled crates.
- Undo payment unchanged. Booking crates for a person with "Schon bezahlt" unchanged.
