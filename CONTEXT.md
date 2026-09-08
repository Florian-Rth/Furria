# Furria — FCC Club Platform

The digital platform of the Furrscher Carnevals Club e.V. ("FURRIA"): public website,
internal Club-App for members, and a guest-facing event web-app. One backend serves all three.
Domain language is German; code identifiers are English — this glossary maps between them.

## Language

### Identity (locked model — three independent layers, never collapse them)

**Person** (`person`):
A human in the club's master-data registry — name, contact, address. The root everything
hangs off. Every Mitglied is a Person; not every Person has an Account — and since
2026-08-18 not every Person is club-affiliated: public self-registration (see Account)
creates Persons with no Mitgliedschaft.
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
first. **Gruppen-Zugehörigkeit requires no Mitgliedschaft** (decided 2026-09-03, backend
kickoff): a Person can belong to a Gruppe — and hold a scoped Amt like Trainer — without being
a Mitglied. Consequence for every Club-App surface: access is gated on **Account + Gruppen +
Ämter, never on "is Mitglied"**; member-only surfaces (Mitgliederversammlung, Beitrag) are
explicit, deliberate exceptions, not the default.
_Avoid_: team, squad, gating anything on Mitgliedschaft by default

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
without a login. Two ways in (decided 2026-08-18, order-flow shaping): member onboarding
stays **invite-only** via Einladung; additionally the public may **self-register** an
Account to buy and keep Karten (mail, Kartenübersicht, history, payment methods) — this
creates a Person with **no Mitgliedschaft**. Buying itself never requires an Account.
The login identifier is the **email address** — there are no usernames
([ADR-0005](docs/adr/0005-auth-aspnet-identity-bearer-tokens.md)).
_Avoid_: user (as a table/entity name), Gast-Konto (it is the same Account concept),
username / Benutzername

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

**Veranstaltung** (`event`):
A ticketed hall evening of the Session — the unit the club sells Karten for, and the only
thing the public website's Veranstaltungen list shows. In everyday German the word is
broader; here it is **narrow**: unticketed happenings (e.g. the Rosenmontagsumzug) are not
Veranstaltungen in this sense and are not listed on the website (the 2026-08-13 narrowing,
carried over from the retired "Programm").
_Avoid_: **Programm** (retired — see flagged note), Termin (as the entity name), Event
(in German copy)

**Ablauf**:
The running order of acts within a single Veranstaltung (the Auto-Reihenfolge) — a
per-event ordering the Club-App manages. Not a list of events. It is planned late: the
responsible person assembles it roughly **two to three weeks before** the evening, so for
most of a Veranstaltung's public life there is no Ablauf at all. What the public website
shows of it is the **order only, never times** — the sequence is stable enough to
publish, the clock is not.
_Avoid_: **Programm** (retired), Setlist

**Live-Regie** (`live direction`):
Running a Veranstaltung's Ablauf on the night itself: one operator advances the running order
and everyone else sees what is on stage now and who is next. It is the Ablauf in its live
state, not a second ordering — the Ablauf stays the one truth, Live-Regie moves a pointer
through it. Confirmed as a real club domain 2026-09-08 (app-shell design handoff).
_Avoid_: Regie (alone — too broad), Show-Control, Moderation

**Klamotten** (`wardrobe`):
Vereinskleidung the club orders and hands out — Garde-Uniformen, Softshell-Jacken, and the
like: what exists, who ordered what, and who currently holds it. Confirmed as a real club
domain 2026-09-08 (app-shell design handoff).
_Avoid_: Kleidung (too broad), Merch (that is sold, this is issued), Uniform (only one kind)

**Karte** (`ticket`):
The unit the club sells for a Veranstaltung — one admission for one person. Price is flat
within an evening and differs between evenings. The word in every UI surface is **Karte**;
the English "Ticket" is banned in copy and labels (the masthead's "Tickets" chip was retired
in E3 — the club sells Karten, but the way in is the Veranstaltungen list, so that is what the
masthead names).
_Avoid_: Ticket (in German copy), Eintrittskarte (in labels — too long), Platz (that is
the seat, not the entitlement)

**Bestellung** (`order`):
One purchase of one or more Karten by one buyer — the unit the checkout produces and the
confirmation mail refers to. A public buyer needs no Account (guest checkout); a Bestellung
is retrieved via an unguessable token link (`orderCode`) sent by mail, never by a guessable
number; self-registering an Account to keep Bestellungen is optional. Pinned 2026-08-18
(order-flow shaping).
_Avoid_: Order (in German copy), Warenkorb (there is no persistent cart), Buchung

**Vorverkauf** (`presale`, short **VVK**):
The window in which Karten for a Veranstaltung can be bought, before the evening itself.
An event's public sales lifecycle is announced → Vorverkauf angekündigt → Vorverkauf läuft
→ ausverkauft / Vorverkauf beendet. Not every Veranstaltung has a VVK date from the
start — it is announced when the club sets it.
_Avoid_: Ticketverkauf, Presale (in German copy)

**Kartenbörse** (`ticket exchange`):
The planned place where a Karte for a sold-out evening can change hands — the club's answer
to "ausverkauft ist nicht das Ende". **Its mechanics are undecided** (return flow, waitlist,
who gets first refusal), **and so are its values** (fixed price, club-run instead of
private resale) — assumptions, not club decisions (exchange shaping, 2026-09-01). The only
confirmed fact is that a Kartenbörse is planned. The Kartenbörse page itself may present
values and mechanics as **clearly-framed plans in the making** — visibly labeled as in
planning, nothing stated as existing, decided or guaranteed (amended 2026-09-01); every
other surface states only that it exists.
_Avoid_: Börse (alone — ambiguous), Weiterverkauf, Resale, Zweitmarkt

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
The curated photo set of exactly **one** club occasion (Prunksitzung, Umzug, Sessionseröffnung).
Not bound to the **Programm** — an Album may cover an unticketed occasion the Programm doesn't
list. Carries its own date; its **Session** is *derived* from that date, never stored.
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

- **"Programm"** — **retired 2026-08-13.** The word was overloaded across the two apps
  (website: the season's ticketed events; Club-App: a per-event running order) and is now
  banned in both senses: the website's list of ticketed evenings is **Veranstaltungen**,
  the Club-App's per-event running order is the **Ablauf**. Shipped copy and identifiers
  still carrying the old word are renamed as part of the events-list page build, never
  left to drift.

- **Sitzplatzvergabe** — **open, 2026-08-18.** The club has not decided how online sales
  assign seats: a fixed numbered seat per Karte (Saalplan/seat picker) or general admission
  against a total count. Until decided, no public surface may claim either mechanic — the
  Kartenwahl step ships as a recognisable placeholder, and copy says **Karten**, never
  Plätze, for the entitlement. The decision unblocks `page-seat-picker` and shapes
  `page-purchase`.

- **Einlasskontrolle** — **open, 2026-08-19.** The club has not decided how entry is checked
  at the door (QR scanning per Karte, a name list, no check at all). Until decided, no public
  surface may show or promise a scannable code, a PDF ticket or a Wallet pass — the digitale
  Karte's face is exactly as undecided as the door practice it would serve. The Bestellung
  confirmation shows the purchase honestly without codes. The decision shapes `page-purchase`'s
  Karten display and the eventual event-app scanner.

- **Gast-Registrierung & Dubletten** — **open, 2026-08-18.** Self-registration can create a
  second Person for a human already in the registry (a Mitglied without Account buys Karten
  online). The merge/claim mechanism (e.g. an Einladung claiming an existing self-registered
  Account by mail match, or an admin merge) is undecided — to be resolved when accounts are
  actually built (Club-App/backend territory).

- **Non-member Gruppen people have no name** — **open, 2026-09-03.** People in a Gruppe
  without Mitgliedschaft are now a supported, first-class case (see **Gruppe**), but the club
  has no canonical word for them yet ("Externe"? "Gruppenmitglied ohne Vereinsmitgliedschaft"?).
  Until the club names them, UI copy avoids inventing a term. Club-side to-do carried with this:
  confirm the Verein's insurance covers non-member group participants — if it only covers
  Mitglieder, that gap is a club decision, not a software one.

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
