# Hall planner — chair math parity fixtures

Same cases in C# (`server/tests/Furria.Api.Tests/Halls/TableChairsTests.cs`) and TS
(`web/apps/club-app/src/features/hall-plan/table-layout.test.ts`). Ruling 6 of `hall-planner.md`.

Standard for every case: `comfortableChairSpacingCm` 60 · `maximumChairSpacingCm` 45 ·
`chairDepthCm` 50.

Table types:

| id | name | shape | lengthCm | widthCm | seatsAtEnds |
|---|---|---|---|---|---|
| 1 | Biertisch | rectangle | 220 | 50 | false |
| 2 | Tisch | rectangle | 120 | 80 | true |
| 3 | Rund | round | 160 | 160 | false |

`sides` written as `front/back/start/end` booleans (F/B/S/E present = true). Plan seating
`comfortable` unless noted. `removed` lists chair overrides with `removed: true`.

| # | type | count | row seating | sides | removed | expected chairs |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | null | F B | — | 6 |
| 2 | 1 | 1 | null (plan `maximum`) | F B | — | 8 |
| 3 | 1 | 4 | null | F B | — | 28 |
| 4 | 2 | 1 | null | F B S E | — | 6 |
| 5 | 2 | 1 | null (plan `maximum`) | F B S E | — | 6 |
| 6 | 2 | 3 | null | F E | — | 7 |
| 7 | 1 | 1 | null | F B S E | — | 6 (ends ignored: no `seatsAtEnds`) |
| 8 | 3 | 1 | null | F B | — | 10 |
| 9 | 3 | 2 | `maximum` | F B | — | 28 |
| 10 | 3 | 1 | null | none | — | 10 (round ignores sides) |
| 11 | 2 | 1 | null | F B S E | front 0, start 0, front 5 | 4 (front 5 does not exist) |
| 12 | 1 | 1 | `maximum` (plan `comfortable`) | F B | — | 8 |
| 13 | 3 | 2 | null | F B | around 12, around 25 | 19 (around 25 does not exist) |
| 14 | 2 | 1 | null | F B S E | front 0, front 0 | 5 (duplicate override counts once) |
| 15 | 2 | 1 | null | F B S E | around 0 | 6 (`around` on a rectangle is ignored) |
| 16 | 3 | 1 | null | F B | front 0 | 10 (`front` on a round row is ignored) |
| 17 | 1 | 1 | null | none | — | 0 |
| 18 | 2 | 2 | null | B | back 3 | 3 |

Arithmetic reminders: long side = `floor(count × lengthCm / spacing)`; end =
`floor(widthCm / spacing)` when enabled and `seatsAtEnds`; round per table =
`floor(π × (lengthCm + chairDepthCm) / spacing)` (Ø160: 659.73 / 60 → 10, / 45 → 14). Round index
runs across the whole row, table-major (count 2 comfortable → indices 0..19).

Plan total = sum of rows; tables = sum of `count`.
