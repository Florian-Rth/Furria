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
creates Persons with no Mitgliedschaft. Whether a Person is **affiliated** at all is derived,
at the moment it is asked, from the relationships that are running
(she holds a Mitgliedschaft, belongs to a Gruppe, or holds a Rolle), never stored as a flag.
_Avoid_: user, contact, profile

**Mitgliedschaft** (`membership`):
Layer A — a Person's **dated period** of club membership: Beitritt and, once over, Austritt.
Several per Person over a lifetime, at most one open at a time; a period has **no kind and no
stored status** (the Mitgliedschaftsart was retired 2026-09-10, see flagged note). The state is
derived: *aktiv* / *ruht* / *beendet* / *kein Mitglied*. **Mitglied seit** is the start of the
earliest period that has begun — a Kündigung and a later Wiedereintritt never reset it. Ending a
Mitgliedschaft closes the period, it never deletes it (pinned 2026-09-10, CA-P1 fresh shaping).
_Avoid_: subscription, Art / Typ (retired), storing the state

**Ruhezeit** (`membership pause`):
A pause inside a running Mitgliedschaft, counted in **whole Sessions** and never in days: a
Mitglied takes a Session — or several, open-ended — off. The Mitgliedschaft is untouched, no
Kündigung happens, and it resumes without a new Beitrittsantrag. While today's Session lies
inside a Ruhezeit the membership *ruht* — that state is derived, never stored. A Ruhezeit
carries **no Grund**; the club never asked for one (pinned 2026-09-10, CA-P1 fresh shaping).
_Avoid_: **Passiv** (the word previously used for this — it wrongly implied a fourth
Mitgliedschaftsart), inactive, Kündigung, Grund (as a field)

**Beitragsermäßigung** (`fee reduction`):
A dated reason a Person pays less — **minderjährig / Schule / Ausbildung / Studium** — recorded
for a span of Sessions. It is a fact of its own and not a tier: *Jugend* used to be a
Mitgliedschaftsart and is one of these instead. The Grundlage is **stated, never derived** from
the Geburtsdatum, and a Beitragsermäßigung always has an end — it expires on its own, so the
Nachweis is renewed (pinned 2026-09-10, CA-P1 fresh shaping).
_Avoid_: Rabatt, Ermäßigung (alone), **Jugend** (as a Mitgliedschaftsart), Grund (the field is
**Grundlage** — Grund was the Ruhezeit reason the club never wanted)

**Gruppe** (`group`):
Layer B — a performing or organisational unit (Tanzgarde, Elferrat, …). Person↔Gruppe is
many-to-many, groups are freely created and archivable. A Mitglied in **no** Gruppe is normal —
Mitgliedschaft and Gruppe are independent axes. Each Gruppe decides for itself whether it is **currently
looking for new members**; that openness is the Gruppe's own setting and the public website shows
it. **There are no open, drop-in trainings** — nobody can simply turn up; an Anfrage always comes
first. **Gruppen-Zugehörigkeit requires no Mitgliedschaft** (decided 2026-09-03, backend
kickoff): a Person can belong to a Gruppe — and be its **Gruppen-Admin** — without being
a Mitglied. Consequence for every Club-App surface: access is gated on **Account + Gruppen +
Rollen, never on "is Mitglied"**; member-only surfaces (Mitgliederversammlung, Beitrag) are
explicit, deliberate exceptions, not the default.
_Avoid_: team, squad, gating anything on Mitgliedschaft by default

**Beitrittsantrag** (`membership application`):
A visitor's request to become a Mitglied, submitted on the public website. It is **not** a
Mitgliedschaft and its sender is **not** a Mitglied — the club still decides on the Aufnahme.
Carries no Account and no Einladung (see **Account**: Mitglied ≠ Account).
_Avoid_: Anmeldung, Registrierung, Bewerbung, calling the sender a Mitglied

**Rolle** (`role`):
Layer C — a named office with a set of Berechtigungen (Präsident, Finanzen, Getränkewart,
Admin, …). **Rollen are created in the app** — a Rolle, its Berechtigungen and its Inhaber are
club data; only the set of Berechtigung *keys* stays a code constant, because the code must
know what it enforces (renamed from **Amt** and pinned 2026-09-11, CA-P1 — and overruling
the earlier "Ämter are NOT freely created"). **Gruppen-Admin** is not a Rolle — it is its own,
Gruppe-scoped resource. There is **no built-in "Vorstand" super-role**; if the club wants one it
creates a Rolle and gives it the keys, like any other.
_Avoid_: **Amt** / Ämter (renamed 2026-09-11), Vorstand (as a right), position, job

**Berechtigung** (`permission`):
A single targeted right (key + area) granted to a **Rolle** through the rights matrix; never
assigned to a Person directly — she has it for as long as she holds the Rolle. The set of keys
is a **code constant** and grows phase by phase (CA-P1 ships four).
_Avoid_: privilege, access level

**Zugehörigkeit** (`group membership`):
A Person's **dated period** in a Gruppe — Beitritt and, once over, Austritt. Several per Person
and Gruppe over a lifetime; "aktuelle Mitglieder einer Gruppe" is derived from open periods.
Leaving a Gruppe ends the period, it never deletes it (pinned 2026-09-10, CA-P1 fresh shaping).
_Avoid_: Mitgliedschaft (that word is the club's, not a Gruppe's), Gruppenmitgliedschaft

**Inhaberschaft** (`role holding`):
A Person's **dated period** in a Rolle — the same shape as a Zugehörigkeit, ended and never
deleted. The **Inhaber** of a Rolle are the open ones (pinned 2026-09-10, CA-P1 fresh shaping).
_Avoid_: Zuweisung, assignment, "im Amt seit" (it is **Inhaberin seit** / Inhaber seit)

**Kontaktdaten** (`contact details`):
Telefon, E-Mail and Adresse of a Person — **hidden from other members by default**; she opts
in herself, and a Person without Account is switched on her word. A Berechtigung sees them
anyway; hidden is a setting, never a gap (pinned 2026-09-10, CA-P1 fresh shaping).
_Avoid_: Kontakt (as a field name), showing hidden Kontaktdaten as missing data

**Gruppen-Admin** (`group admin`):
The Person responsible for a Gruppe — set in group management, dated, several per Gruppe
possible. It is **not** a Zugehörigkeit: a Gruppen-Admin need not belong to the Gruppe she runs
(the Kindergarde is 6–11, ihre Trainerin ist 43), and she stays Gruppen-Admin after she stops
dancing herself. She may carry a **Funktion** — a free-text label (Trainerin, Sprecher,
Kommandantin) that is shown and nothing more: the rights come from
being Gruppen-Admin, never from the Funktion. In the rights matrix **Gruppen-Admin is one
resource**, configured once and always scoped to the Gruppe it is held for (pinned 2026-09-10,
CA-P1 fresh shaping).
_Avoid_: **Trainer** (as a Rolle of its own — it is a Funktion of a Gruppen-Admin), coach,
Gruppenleiter (as an entity name), treating it as membership in the Gruppe

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
The yearly membership fee. It is **not** tiered by a Mitgliedschaftsart any more — the Art was
retired 2026-09-10; what lowers it is a **Beitragsermäßigung**, a dated fact on the Person, and
whether a Ruhezeit lowers it at all is an open club question (see flagged note). Nothing about
the Beitrag is computed or billed anywhere yet.
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

- **Gruppentermin** — **open 2026-09-10, reframed 2026-09-17.** A Gruppe's own schedule
  (Training, Auftritt) is a real need for the Gruppen-Hub, but **Veranstaltung** is deliberately
  narrow and the club has no pinned word for a Gruppe's own dates.

  The Club-App floor plan ruled on 2026-09-17 that there is **one club calendar**, not several:
  one store holds Veranstaltungen, unticketed club occasions, members-only events and a Gruppe's
  own dates alike, and every surface is a filter over it — a Gruppe's dates band is that calendar
  scoped to the Gruppe. That changes the missing word: the club does not need a name for *a
  Gruppe's dates*, it needs one for **an entry in the club calendar**, of which a training is one
  kind. **Veranstaltung** cannot be it (it stays narrow), and **Termin** is on that entry's own
  avoid-list.

  Until the club names it, nothing is modelled and no surface promises it: the Hub's dates slot
  is a reserved placeholder, and no copy calls it a Spielplan. It blocks the Kalender page, the
  Verein hub's calendar band and the Gruppe hub's dates band.

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

- **Beitrag während einer Ruhezeit** — **open, 2026-09-11.** Whether a Mitglied pays while her
  Mitgliedschaft *ruht* is a club question nobody has answered. Until it is, no copy may say a
  Ruhezeit costs nothing: a Ruhezeit is described by what it does to the state (ab der Session
  zählt sie nicht als aktiv), never by what it does to the Beitrag.

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

- **Mitgliedschaftsart** — **retired 2026-09-10.** Layer A is the Mitgliedschaft itself and the
  Art is gone: **a Mitgliedschaft is a dated period, and a period has no kind**. The three values
  the note above pinned were redistributed — *Aktiv* is the derived state, *Jugend* is a
  **Beitragsermäßigung** on the Grundlage minderjährig, *Ehren* is the **Ehrenmitgliedschaft**,
  an honour that runs alongside. `MembershipType` and `MembershipStatus` are deleted outright and
  the status is no longer stored either; no surface, chip or filter may name an Art again. This
  supersedes the `Passiv` retraction above, which settled the Art it now retires.

- **Ehrenmitgliedschaft** — **removed from CA-P1 2026-09-11.** The honour the club confers is
  real and it is **not** a kind of Mitgliedschaft — it runs alongside one, and an Ehrenmitglied
  is **not published on the public website**. It is nevertheless **owed to a later phase**:
  nothing is modelled, nothing is conferred in the app, and until it is, no surface carries an
  Ehrenmitglied marker, seal or filter — the design mocks that showed one are ignored for
  exactly that reason.

## Example dialogue

> **Dev:** Lisa logs in and can edit the Tanzgarde calendar — is she Vorstand?
> **Expert:** There is no Vorstand right. She's a Person with an Account, her Mitgliedschaft
> is running, and someone made her Gruppen-Admin der Tanzgarde with the
> Funktion "Trainerin" — that is scoped to exactly that Gruppe.
> **Dev:** And her grandfather in the registry who never logs in?
> **Expert:** A Person with an Ehren-Mitgliedschaft and no Account. If he ever wants the app,
> the Geschäftsführer prints him an Einladung.
