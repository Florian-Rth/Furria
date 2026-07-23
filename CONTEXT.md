# Furria — FCC Club Platform

The digital platform of the Furrscher Carnevals Club e.V. ("FURRIA"): public website,
internal Club-App for members, and a guest-facing event web-app. One backend serves all three.
Domain language is German; code identifiers are English — this glossary maps between them.

## Language

### Identity (locked model — three independent layers, never collapse them)

**Person** (`person`):
A human in the club's master-data registry — name, contact, address. The root everything
hangs off. Every Mitglied is a Person; not every Person has an Account.
_Avoid_: user, contact, profile

**Mitgliedschaft** (`membership`):
The one-per-Person record of club membership: its Art, status, and period.
_Avoid_: subscription

**Mitgliedschaftsart** (`membership type`):
Layer A of identity — exactly one per Mitglied: Aktiv / Passiv / Jugend / Ehren. Drives the
yearly Beitrag tier.
_Avoid_: role, member level

**Gruppe** (`group`):
Layer B — a performing or organisational unit (Tanzgarde, Elferrat, …). Person↔Gruppe is
many-to-many, groups are freely created and archivable.
_Avoid_: team, squad

**Amt** (`role`):
Layer C — an office from a **fixed, rights-bearing set** (Präsident, Finanzen, Getränkewart,
Trainer, Admin, …). Grants targeted permissions via the rights matrix. Ämter are NOT freely
created, and there is **no all-access "Vorstand" super-role**. In code the table is `role`.
_Avoid_: Vorstand (as a right), position, job

**Berechtigung** (`permission`):
A single targeted right (key + area) granted to an Amt through the rights matrix; never
assigned to a Person directly.
_Avoid_: privilege, access level

**Trainer**:
A per-Gruppe Amt. Conferred by setting a Person as a Gruppe's trainer in group management —
this auto-grants Trainer rights scoped to that one Gruppe only.
_Avoid_: coach

**Account** (`account`):
An optional, 1:1-linked login for a Person. **Mitglied ≠ Account** — membership exists
without a login; onboarding is invite-only.
_Avoid_: user (as a table/entity name)

**Einladung** (`invitation`):
A one-time onboarding token (link or printed QR/code) that lets a Person create their Account.
_Avoid_: signup, registration

### Club culture

**Narrenruf**:
The club's carnival call: **"Gross - Furria!"** — always this, spoken and in UI copy.
_Avoid_: Helau, Alaaf — using these will get you hated in Großfurra.

**Session** (`session`):
A carnival season: opens **11.11.** (the **Eröffnung**) and runs to Aschermittwoch. Numbered from
the founding year (Session Nº 1 = 1971) and labelled by its span (e.g. `2025/26`). The unit the
public site advertises ("SESSION …", "die fünfte Jahreszeit").
_Avoid_: Kampagne, campaign, season (as a table name)

### Events

**Programm**:
Overloaded across the two apps — **do not collapse the two senses**:
- **Public website:** the **season's public event lineup** — the events the club presents,
  the same set the Veranstaltungskalender lists. This is what "DAS PROGRAMM", the `/program`
  route and the "Programm" nav label mean on the website.
- **Club-App:** the **running order of acts within a single event** (the Auto-Reihenfolge /
  Reihenfolge). A per-event ordering, not a list of events.
_Avoid_: using "Programm" without knowing which app you are in.

### Money

**Beitrag** (`fee`):
The yearly membership fee, tiered by Mitgliedschaftsart.
_Avoid_: dues, subscription fee

**Ledger**:
The single source of truth for all money movements (Beitrag, Shop, Getränkekasse, Tickets).
Payment providers (Stripe, PayPal, bar) are pluggable ways to settle ledger entries, never a
parallel truth.
_Avoid_: balance table, payments table (as source of truth)

## Flagged ambiguities

- **Mitgliedschaftsart `Passiv`** — resolved 2026-07-16: the handoff's four types
  (Aktiv / Passiv / Jugend / Ehren) are authoritative. The DBML enum was missing `passive`
  and has been corrected in `docs/design/FCC-Schema.txt`.

## Example dialogue

> **Dev:** Lisa logs in and can edit the Tanzgarde calendar — is she Vorstand?
> **Expert:** There is no Vorstand right. She's a Person with an Account, her Mitgliedschaft
> is Aktiv, and someone set her as Trainer of the Tanzgarde — that Amt is scoped to exactly
> that Gruppe.
> **Dev:** And her grandfather in the registry who never logs in?
> **Expert:** A Person with an Ehren-Mitgliedschaft and no Account. If he ever wants the app,
> the Geschäftsführer prints him an Einladung.
