# Every sortable name column carries the German ICU collation

`person.first_name`, `person.last_name`, `group.name` and `role.name` are declared
`COLLATE "de-DE-x-icu"` in the schema itself (migration `SortableNames`, 2026-09-11), not
collated per query. Decided while hardening the CA-P1 foundation, after a review showed that
the only sort order the club will accept could not use any of the indexes we had built for it.

## The problem the column collation solves

The shipped database is `postgres:18-alpine`, whose default collation is libc on musl — byte
order. Under it `ORDER BY name` reads *Anton, Zebra, Ärzte*: every umlaut sorts after `Z`. The
only way to get *Anton, Ärzte, Zebra* used to be `ORDER BY name COLLATE "de-DE-x-icu"` at each
call site, and a collation named in the query does not match a btree built without one — so
`ix_person_last_name_first_name`, the list's sort index, was dead for the one query it exists
for, and every German list was a seq scan plus a sort.

The second, quieter half is uniqueness. `ix_group_name_active` and `ix_role_name_active` are
`UNIQUE (lower(name)) WHERE archived_on IS NULL`, and `lower()` follows the column's collation.
In a `C`-locale database `lower('Ä')` is `'Ä'`, so "Ärzte" and "ärzte" would both be insertable
and the club would hold two Gruppen with the same name. Pinning the collation on the column
pins `lower()` with it — verified by execution, and now pinned by `CollationTests`, which goes
red the moment `UseCollation` disappears from the model.

## Consequences

- **Every new user-visible name column carries `.UseCollation("de-DE-x-icu")`** — the rule now
  reads off `PersonConfiguration`, `GroupConfiguration` and `RoleConfiguration`. A column that
  skips it sorts umlauts after `Z` and silently opts out of the uniqueness guarantee above.
- **`EF.Functions.Collate` belongs nowhere in queries or assertions.** The column decides. The
  one call site that had it (`GroupSetExpectations.ToReadInGermanOrder`) was exactly why the old
  umlaut test passed against an unconfigured schema.
- **A non-C collation removes `LIKE 'x%'` prefix-scan support from these btrees.** Accepted: the
  Personensuche (P1 slice 11) filters with a leading wildcard, so it needs a `pg_trgm` GIN index
  either way. A later feature that genuinely wants prefix scans adds a second index with
  `text_pattern_ops` rather than dropping the collation.
- **The production database must ship ICU with the `de-DE-x-icu` locale.** `postgres:18-alpine`
  does, in `docker-compose.example.yml` as in the Testcontainer; a future image swap has to be
  checked against `CollationTests` before it ships.
