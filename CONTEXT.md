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
The one-per-Person record of club membership: its Art, status, and period. **Art and status are
different axes** and never share a field — the Art is the tier, the status is the current state.
_Avoid_: subscription

**Mitgliedschaftsart** (`membership type`):
Layer A of identity — exactly one per Mitglied: **Aktiv / Jugend / Ehren**. Drives the yearly
Beitrag tier. Only **Aktiv** and **Jugend** can be applied for; **Ehren** is conferred and is
**not published on the public website**.
_Avoid_: **Passiv** (never an Art — see Ruhende Mitgliedschaft), role, member level

**Ruhende Mitgliedschaft** (`paused`):
A **status** of a Mitgliedschaft, not an Art: a Mitglied takes a Session off. The Art is untouched,
no Kündigung happens, and it resumes without a new Beitrittsantrag. In German UI copy the
membership *ruht*.
_Avoid_: **Passiv** (the word previously used for this — it wrongly implied a fourth
Mitgliedschaftsart), inactive, Kündigung

**Gruppe** (`group`):
Layer B — a performing or organisational unit (Tanzgarde, Elferrat, …). Person↔Gruppe is
many-to-many, groups are freely created and archivable. A Mitglied in **no** Gruppe is normal —
Art and Gruppe are independent axes. Each Gruppe decides for itself whether it is **currently
looking for new members**; that openness is the Gruppe's own setting and the public website shows
it. **There are no open, drop-in trainings** — nobody can simply turn up; an Anfrage always comes
first.
_Avoid_: team, squad

**Beitrittsantrag** (`membership application`):
A visitor's request to become a Mitglied, submitted on the public website. It is **not** a
Mitgliedschaft and its sender is **not** a Mitglied — the club still decides on the Aufnahme.
Carries no Account and no Einladung (see **Account**: Mitglied ≠ Account).
_Avoid_: Anmeldung, Registrierung, Bewerbung, calling the sender a Mitglied

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

### Öffentliche Kommunikation

**Aktuelles** (`news`):
The public website's news section — the chronological stream of **Meldungen**. Deliberately not
a blog: no tags, comments, author pages or search.
_Avoid_: Neuigkeiten, News, Blog

**Meldung** (`news post`):
One dated announcement in **Aktuelles** — a short notice or report (Motto-Verkündung, a result,
a call for helpers). Carries exactly one **Kategorie**.
_Avoid_: **Beitrag** (that word is the membership fee — never a news item), Artikel, Post

**Kategorie** (`news category`):
The one label a **Meldung** carries, from a fixed set. Label only — the public site offers no
filtering by it.
_Avoid_: Tag, Rubrik

### Fotos

**Galerie** (`gallery`):
The public website's photo section — a handful of curated **Alben**, view-only. Deliberately not
an archive: no uploads, no downloads, no endless feed; each Album shows a hand-picked selection,
not everything that was shot.
_Avoid_: **Bildergalerie** (that is the Club-App's surface — see below), Fotoarchiv, Mediathek

**Bildergalerie**:
The **Club-App's** planned member-facing photo surface (upload + browse). Not built, and not the
name of the public page.
_Avoid_: using it for the public **Galerie**

**Album** (`album`):
The curated photo set of exactly **one** occasion (Prunksitzung, Umzug, Sessionseröffnung) — the
same kind of occasion the **Programm** lists. Carries its own date; its **Session** is *derived*
from that date, never stored.
_Avoid_: Galerie (for a single album), Ordner, Sammlung

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

- **Who decides a photo is public** — **open, 2026-07-28.** No rules exist yet, and it is not
  settled whether any of this gets built. The public **Galerie** needs none of it today: it shows
  the pictures the club put into it, and the only real-world remedy is the takedown contact printed
  on the page. Two *candidate* senses have surfaced, from the Club-App handoff, and they are not
  the same thing — if this is ever modelled, do not collapse them into one `is_public` flag:
  a **per-photo** release ("für Website freigeben") is about *photos*, while a **Person**-level
  consent to being photographed at all is about *people*. Neither implies the other. Until someone
  actually decides, neither term is canonical language.

- **Mitgliedschaftsart `Passiv`** — **retracted 2026-07-29.** The 2026-07-16 note declared the
  handoff's four types (Aktiv / Passiv / Jugend / Ehren) authoritative and added `passive` to the
  DBML enum. The domain expert overturned that during P6 shaping: **`Passiv` was never an Art** —
  it was the word for a membership that *pauses for a Session*, which is a **status**. `Art` is now
  Aktiv / Jugend / Ehren and `status` is aktiv / **paused** / beendet;
  `docs/design/FCC-Schema.txt` has been corrected accordingly (`passive` removed from
  `membership_type`, `inactive` → `paused` in `membership_status`). **Lesson:** the earlier note
  resolved the ambiguity from the *handoff* rather than from the club.

## Example dialogue

> **Dev:** Lisa logs in and can edit the Tanzgarde calendar — is she Vorstand?
> **Expert:** There is no Vorstand right. She's a Person with an Account, her Mitgliedschaft
> is Aktiv, and someone set her as Trainer of the Tanzgarde — that Amt is scoped to exactly
> that Gruppe.
> **Dev:** And her grandfather in the registry who never logs in?
> **Expert:** A Person with an Ehren-Mitgliedschaft and no Account. If he ever wants the app,
> the Geschäftsführer prints him an Einladung.
