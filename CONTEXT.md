# Furria — FCC Club Platform

The digital platform of the Furrscher Carnevals Club e.V. ("FURRIA"): public website,
internal club app for members, and a guest-facing event web app. One backend serves all three.

## Language rule — English everywhere, German only on screen

**Docs, plans, ADRs, comments, identifiers, commit messages and chat are English.** The only
German in this repo is **user-facing copy** — the strings a visitor or member actually reads
([ADR-0002](docs/adr/0002-german-only-ui.md)) — plus proper names (the club's name, the village
Großfurra, the carnival call). Tests may quote German copy because they assert on what the
screen says.

This glossary is the **single translation**. Every term below has one canonical English name
(bold) — use it in prose and code, never a synonym and never the German word. The *UI copy*
line gives the German word the screens use; it exists so copy stays consistent, not as a second
name for the concept. When a German domain word is not in this file, add it here before using an
English rendering anywhere else, so two translations never drift apart.

### Quick reference

| Canonical term | UI copy (German) | Code |
|---|---|---|
| person | Person | `Person` |
| member | Mitglied | — (derived) |
| membership | Mitgliedschaft | `Membership` |
| membership pause | Ruhezeit | `MembershipPause` |
| fee reduction / basis | Beitragsermäßigung / Grundlage | `FeeReduction`, `FeeReductionBasis` |
| group | Gruppe | `Group` |
| group kind | Gruppenart | `GroupKind` |
| group profile | Steckbrief | — |
| founded year | Gründungsjahr | `FoundedYear` |
| group tone | Gruppenfarbe | `GroupTone` |
| training rhythm / training slot | Trainingsrhythmus / Trainingsslot | `GroupTrainingSlot` |
| anniversary | Jubiläum | — (derived) |
| group membership | Zugehörigkeit | `GroupMembership` |
| group admin / function | Gruppen-Admin / Funktion | `GroupAdmin`, `Function` |
| membership application | Beitrittsantrag | `MembershipApplication` |
| role / permission | Rolle / Berechtigung | `Role`, `RolePermission` |
| role holding / holder | Inhaberschaft / Inhaber | `RoleHolding` |
| board / board office / board seat | Vorstand / Vorstandsfunktion / Vorstandssitz | `BoardOffice`, `BoardSeat` |
| contact details | Kontaktdaten | — |
| portrait | Porträt | — |
| account / invitation | Account / Einladung | `Account`, — |
| club | Verein | — |
| club hub / group hub / management | Verein / Gruppe / Verein verwalten | `club`, `group-hub`, `manage` |
| tile | Kachel | — |
| carnival call | Narrenruf | `CarnivalCall…` |
| join in (the "get involved" call to action) | Mitmachen | `JoinIn…` |
| master data (a person's or club's base record) | Stammdaten | — |
| appointment (retired — say **calendar entry**) | Termin | — |
| session / season opening | Session / Eröffnung | `Session`, `ClubSession` |
| session record | Sessionseintrag | `Session` |
| motto / motto stage | Motto / Motto-Bühne | — |
| session logo | Sessionslogo | — |
| chronicle | Chronik | — |
| session medal | Orden | — |
| event | Veranstaltung | `Event` |
| running order | Ablauf | — |
| live direction | Live-Regie | — |
| calendar entry | Kalendereintrag | `CalendarEntry` |
| owner / visibility | Eigentümer / Sichtbarkeit | `Owner…`, `CalendarEntryVisibility` |
| participating groups | Mitwirkende Gruppen | `CalendarEntryGroup` |
| attendance response | Zu-/Absage | `AttendanceResponse` |
| venue / city / note | Ort / Stadt / Hinweis | `Venue` |
| key holding | Schlüssel | `KeyHolding` |
| wardrobe | Klamotten | — |
| ticket | Karte | `Ticket…` |
| order | Bestellung | `Order` |
| presale | Vorverkauf (VVK) | — |
| ticket exchange | Kartenbörse | — |
| news / news post / news category | Aktuelles / Meldung / Kategorie | `NewsPost`, `NewsCategory` |
| lead post (the news post opening the page) | Aufmacher | `NewsLead…` |
| announcement | Aushang | `Announcement` |
| gallery / album | Galerie / Album | `Gallery`, `Album` |
| member photo library | Bildergalerie | — |
| fee | Beitrag | — |
| ledger | — | — |
| general meeting | Mitgliederversammlung | — |
| seat allocation | Sitzplatzvergabe | — |
| entry check | Einlasskontrolle | — |
| honorary membership | Ehrenmitgliedschaft | — |
| group directory (the club app's list of all groups) | Gruppenverzeichnis | — |
| person management | Personenverwaltung | `manage-persons` |
| maintain / upkeep (a screen's edit action; role names like *Gruppenpflege* are club data) | Pflegen / -pflege | — |
| vacant (a role or office nobody holds) | unbesetzt | — |
| session number | Sessionsnummer | — |
| storeroom | Lager | — |
| summer event (the members-only summer party) | Sommerfest | — |
| motto stage states: teaser / running / resting | Teaser / Läuft / Ruhe | `KkMottoStageState` |
| door sales | Abendkasse | — |
| beer list | Bierliste | — |
| privacy policy | Datenschutzerklärung | — |

**Carnival vocabulary** — use these English names in prose; the German only appears as copy or
as the literal name of one of the club's groups or evenings:

| English | German | | English | German |
|---|---|---|---|---|
| dance guard | Tanzgarde / Garde | | gala session | Prunksitzung |
| children's guard | Kindergarde | | children's carnival | Kinderfasching |
| Council of Eleven | Elferrat | | Rose Monday parade | Rosenmontagsumzug |
| men's ballet | Männerballett | | Ash Wednesday | Aschermittwoch |
| show dance | Showtanz | | carnival club | Karnevalsverein |
| carnival speech | Büttenrede | | carnival season ("the fifth season") | Session ("die fünfte Jahreszeit") |
| beer guard | Biergarde | | carnival | Karneval / Fasching |

Office names follow the same rule: president (Präsident), treasurer (Kassenwart / Finanzen),
secretary (Schriftführerin), drinks warden (Getränkewart), managing director (Geschäftsführer),
trainer (Trainerin), speaker (Sprecher), commander (Kommandantin).

## Terms

### Identity (locked model — three independent layers, never collapse them)

**Person**:
A human in the club's master-data registry — name, contact, address. The root everything
hangs off. Every **member** is a person; not every person has an **account** — and since
2026-08-18 not every person is club-affiliated: public self-registration (see **account**)
creates persons with no **membership**. Whether a person is **affiliated** at all is derived,
at the moment it is asked, from the relationships that are running (she holds a membership,
belongs to a group, or holds a role), never stored as a flag.
_UI copy_: Person
_Avoid_: user, contact, profile

**Member**:
A person whose **membership** is running. Not an entity of its own — "is a member" is derived
from the membership periods.
_UI copy_: Mitglied
_Avoid_: user, gating a surface on "is a member" (see **permission**)

**Membership** (`Membership`):
Layer A — a person's **dated period** of club membership: a start (joining) and, once over, an
end (leaving). Several per person over a lifetime, at most one open at a time; a period has
**no kind and no stored status** (the membership type was retired 2026-09-10, see flagged note).
The state is derived: **active** / **paused** / **ended** / **none** (`MembershipState`).
**Member since** is the start of the earliest period that has begun — a resignation and a later
rejoining never reset it. Ending a membership closes the period, it never deletes it (pinned
2026-09-10, CA-P1 fresh shaping).
_UI copy_: Mitgliedschaft; states *aktiv* / *ruht* / *beendet* / *kein Mitglied*; *Mitglied seit*,
*Beitritt*, *Austritt*, *Kündigung*, *Wiedereintritt*
_Avoid_: subscription, type / kind (retired), storing the state

**Membership pause** (`MembershipPause`):
A pause inside a running membership, counted in **whole sessions** and never in days: a member
takes a session — or several, open-ended — off. The membership is untouched, no resignation
happens, and it resumes without a new **membership application**. While today's session lies
inside a membership pause the membership is *paused* — that state is derived, never stored. A
membership pause carries **no reason**; the club never asked for one (pinned 2026-09-10, CA-P1
fresh shaping).
_UI copy_: Ruhezeit
_Avoid_: **passive** (the word previously used for this — it wrongly implied a fourth membership
type), inactive, resignation, reason (as a field)

**Fee reduction** (`FeeReduction`):
A dated reason a person pays less — its **basis** is **minor / school / apprenticeship /
studies** (`FeeReductionBasis`) — recorded for a span of sessions. It is a fact of its own and
not a tier: *youth* used to be a membership type and is one of these instead. The basis is
**stated, never derived** from the date of birth, and a fee reduction always has an end — it
expires on its own, so the proof is renewed (pinned 2026-09-10, CA-P1 fresh shaping).
_UI copy_: Beitragsermäßigung; basis *Grundlage*: minderjährig / Schule / Ausbildung / Studium;
proof *Nachweis*
_Avoid_: discount, reduction (alone), **youth** (as a membership type), reason (the field is
**basis** — "reason" was the membership-pause field the club never wanted)

**Group** (`Group`):
Layer B — a performing or organisational unit (the dance guard, the Council of Eleven, …).
Person↔group is many-to-many, groups are freely created and archivable. A member in **no** group
is normal — membership and group are independent axes. Each group decides for itself whether it
is **currently looking for new members**; that openness is the group's own setting and the
public website shows it. **There are no open, drop-in trainings** — nobody can simply turn up;
an inquiry always comes first. **Group membership requires no membership** (decided 2026-09-03,
backend kickoff): a person can belong to a group — and be its **group admin** — without being a
member. Consequence for every club-app surface: access is gated on **account + groups + roles,
never on "is a member"**; member-only surfaces (general meeting, fee) are explicit, deliberate
exceptions, not the default.

Since CA-P6 a group also carries a **group profile it maintains itself**
([ADR-0014](docs/adr/0014-the-group-hub-writes-its-own-record.md)): its **group kind**, a
**founded year** — a year, never a date, because nobody remembers the day the beer guard
formed — a **group tone** and a **training rhythm**, a list of **training slots**
(`GroupTrainingSlot`), each `(weekday, time, duration, venue)`. The **anniversary** is *derived*
from the founded year at every fifth year and never stored; a club that celebrates a 13th
anniversary celebrates nothing. The group tone comes from an identity palette that shares no
value with the status tones (green = ok/paid, gold = warning, red = action), so a calendar tinted
by group never accidentally says *paid*. The training rhythm is a **stated habit, not a rule**:
it is what the group says it does, the calendar holds what actually happens, and the two are
allowed to disagree — generating trainings from it writes ordinary **calendar entries** and
nothing on them remembers the batch.
_UI copy_: Gruppe; Steckbrief, Gründungsjahr, Gruppenfarbe, Trainingsrhythmus, Trainingsslot,
Jubiläum
_Avoid_: team, squad, gating anything on membership by default, recurring appointment /
recurrence rule (for the training rhythm), storing the anniversary, age group (ruled out
2026-09-21 — the name and the description say it, and it would lie about the children's guard's
43-year-old trainer)

**Group kind** (`GroupKind`):
What a group *is* — dance guard, show dance, men's ballet, singing, carnival speech, music,
sketch, organisation. A named, archivable record the club composes itself, exactly as it composes
its roles, venues and board offices; it is never a code constant (ruled 2026-09-21, CA-P6
shaping). One group kind per group. It groups the public website's group presentation and the
club app's group list, and it is what a later **running order** hangs on. *Organisation* is the
kind that does not perform — the Council of Eleven, tech, kitchen.
_UI copy_: Gruppenart (values: Tanzgarde, Showtanz, Männerballett, Gesang, Büttenrede, Musik,
Sketch, Organisation)
_Avoid_: category, type, division, treating it as an enum in code

**Membership application**:
A visitor's request to become a member, submitted on the public website. It is **not** a
membership and its sender is **not** a member — the club still decides on the admission.
Carries no account and no invitation (see **account**: member ≠ account).
_UI copy_: Beitrittsantrag
_Avoid_: sign-up, registration, application (alone), calling the sender a member

**Role** (`Role`):
Layer C — a named office with a set of **permissions** (president, finance, drinks warden,
admin, …). **Roles are created in the app** — a role, its permissions and its holders are club
data; only the set of permission *keys* stays a code constant, because the code must know what
it enforces (renamed from **office** — German *Amt* — and pinned 2026-09-11, CA-P1, overruling
the earlier "offices are NOT freely created"). **Group admin** is not a role — it is its own,
group-scoped resource. There is **no built-in "board" super-role**; if the club wants one it
creates a role and gives it the keys, like any other.
_UI copy_: Rolle
_Avoid_: **office** / *Amt* (renamed 2026-09-11), board (as a right — the body itself is
recorded, see **board**), position, job

**Permission** (`RolePermission`, permission keys):
A single targeted right (key + area). **Every gate in the app is a permission** — no surface is
ever gated on "is a member" directly. A person's effective keys come from **two sources**:
granted to a **role** through the rights matrix (she has it for as long as she holds the role),
or **implied by a relationship that is running** — a membership implies `club.read`, a group
membership implies its group-scoped keys. Neither is ever assigned to a person directly and
neither is stored: the implied keys are derived at the moment they are asked, exactly as
affiliation is ([ADR-0011](docs/adr/0011-permissions-come-from-roles-and-running-relationships.md),
2026-09-18). The set of keys is a **code constant** and grows phase by phase.
_UI copy_: Berechtigung
_Avoid_: privilege, access level, a **member role** (there is none — see ADR-0011)

**Group membership** (`GroupMembership`):
A person's **dated period** in a group — joining and, once over, leaving. Several per person and
group over a lifetime; "a group's current members" is derived from open periods. Leaving a group
ends the period, it never deletes it (pinned 2026-09-10, CA-P1 fresh shaping).
_UI copy_: Zugehörigkeit
_Avoid_: membership (alone — that word is the club's, not a group's)

**Role holding** (`RoleHolding`):
A person's **dated period** in a role — the same shape as a group membership, ended and never
deleted. The **holders** of a role are the open ones (pinned 2026-09-10, CA-P1 fresh shaping).
_UI copy_: Inhaberschaft; *Inhaberin seit* / *Inhaber seit*
_Avoid_: assignment, "in office since"

**Board** (`board`):
The club's official governing body. It is **not a fourth identity layer and not a role** — it
grants nothing by itself. What it may do is **name one role that every seat implies**, so the
club expresses "everyone on the board may do this" once. Recorded because every club has a board
and members ask who is on it, not because the app needs it to decide anything (decided
2026-09-19).
_UI copy_: Vorstand
_Avoid_: board as a permission or a super-role (see **role**), leadership, management

**Board office** (`BoardOffice`):
A named office within the **board** — president, treasurer, secretary. **Club-created and edited
in the app**, never a code constant, and each may **name one role it implies**. This is the one
function that is more than a label; the **group admin**'s function stays free text and grants
nothing, and the two are never unified (decided 2026-09-19).
_UI copy_: Vorstandsfunktion
_Avoid_: office (alone — retired), post, hard-coding the offices

**Board seat** (`BoardSeat`):
A person's **dated period** on the **board** under one **board office** — the same shape as a
role holding, ended and never deleted, and carrying the board's display order. A running seat
**implies** its office's role: derived at the moment it is asked, never written as a role
holding (the board-wide role was cut 2026-09-20 and waits for **club management**)
([ADR-0011](docs/adr/0011-permissions-come-from-roles-and-running-relationships.md)).
_UI copy_: Vorstandssitz
_Avoid_: auto-assigning a role when a seat opens, board membership (that word is the club's
membership), board office (for the seat)

**Contact details**:
Phone, email and address of a person — **hidden from other members by default**; she opts in
herself, and a person without account is switched on her word. A permission sees them anyway;
hidden is a setting, never a gap (pinned 2026-09-10, CA-P1 fresh shaping).
_UI copy_: Kontaktdaten (Telefon, E-Mail, Adresse)
_Avoid_: contact (as a field name), showing hidden contact details as missing data

**Portrait**:
The **one** picture a person has in the platform, in rectangular portrait format — her profile
picture in the app, and the same file shown in the round wherever a list needs an avatar. A
portrait is **provided, never taken**: the person hands it over to be shown, and that act is the
consent — which is why it is untouched by the open question about event photography. Showing it
publicly is a **switch she owns, off by default**, exactly as her contact details are; holding a
**board seat** never flips it (decided 2026-09-19).
_UI copy_: Porträt
_Avoid_: photo (that is event photography — a different question entirely), avatar (that is how
a portrait is *displayed*), a second picture for the website, publishing by virtue of an office

**Group admin** (`GroupAdmin`):
The person responsible for a group — set in group management, dated, several per group possible.
It is **not** a group membership: a group admin need not belong to the group she runs (the
children's guard is 6–11, its trainer is 43), and she stays group admin after she stops dancing
herself. She may carry a **function** (`Function`) — a free-text label (trainer, speaker,
commander) that is shown and nothing more: the rights come from being group admin, never from
the function. In the rights matrix **group admin is one resource**, configured once and always
scoped to the group it is held for (pinned 2026-09-10, CA-P1 fresh shaping).
_UI copy_: Gruppen-Admin; *Funktion*
_Avoid_: **trainer** (as a role of its own — it is a function of a group admin), coach, group
leader (as an entity name), treating it as membership in the group, **appointment** (German *Ernennung* —
its dated period is the group admin's **tenure**; "appointment" is the retired word for a calendar entry)

**Account** (`Account`):
An optional, 1:1-linked login for a person. **Member ≠ account** — membership exists without a
login. Two ways in (decided 2026-08-18, order-flow shaping): member onboarding stays
**invite-only** via **invitation**; additionally the public may **self-register** an account to
buy and keep **tickets** (mail, ticket overview, history, payment methods) — this creates a
person with **no membership**. Buying itself never requires an account. The login identifier is
the **email address** — there are no usernames
([ADR-0005](docs/adr/0005-auth-aspnet-identity-bearer-tokens.md)). **The MVP has no child
accounts** (ruled 2026-09-21, CA-P6 shaping): nobody under the club's own age of consent gets a
login, and no account is held on another person's behalf. A child in the children's guard is a
person with a group membership and no account, exactly like a member who never asked for the
app — so no surface may assume the dancer is the one reading it.
_UI copy_: Account
_Avoid_: user (as a table/entity name), guest account (it is the same account concept),
username

**Invitation**:
A one-time onboarding token (link or printed QR/code) that lets a person create their account.
_UI copy_: Einladung
_Avoid_: sign-up, registration

### Club app structure

**Club** / **club hub**:
The club itself (German *Verein*) and the club app's hub for it — the one screen that is
identical for every viewer ([ADR-0010](docs/adr/0010-club-app-is-a-set-of-scope-hubs.md)).
**Group hub** is the same idea scoped to one group; **club management** (`/manage`, the back
office) is where the club's records are written. A **tile** is one entry card on a hub.
_UI copy_: Verein; Gruppe; Verein verwalten; Kachel
_Avoid_: association, society, admin area (for club management)

### Club culture

**Carnival call**:
The club's carnival call: **"Gross - Furria!"** — always this, spoken and in UI copy.
_UI copy_: Narrenruf
_Avoid_: Helau, Alaaf — using these will get you hated in Großfurra.

**Session** (`Session`, `ClubSession`):
A carnival season: opens on **11 November** (the **season opening**) and runs to Ash Wednesday,
and is labelled by its span (e.g. `2025/26`). The unit the public site advertises ("SESSION …",
"die fünfte Jahreszeit"). **Which season it is now is derived from the date and never stored** —
the 11 November boundary decides it, so no surface has a "current session" pointer anybody has to
flip.

**The session number is evidence, not arithmetic** (ruled 2026-09-18, superseding "numbered from
the founding year, Nº 1 = 1971"). Sessions were skipped — war, crises, pandemics — so no formula
over years can produce the right number, and the club anyway *knows* a number because it is
printed on the **session medal**. The club therefore writes down what it knows, one **session
record** per season: its Nº, its **motto**, its **session logo**. **Every part of a record but the
year is optional**, because the chronicle is incomplete in both directions (a banner photo gives a
motto with no Nº; an anniversary booklet gives a Nº with no motto), and **nothing is ever inferred
from a neighbouring record** — a guessed Nº could contradict the medal. No record for a season
means the app names the season from the date and says nothing further.
_UI copy_: Session; Eröffnung
_Avoid_: campaign, season (as a table name), computing the Nº from the founding year, a stored
"current session" flag

**Motto**:
The session's slogan, proclaimed by the club before the season and printed on everything that
season — "FURRIA — Der Mittelpunkt des Universums". One per session, part of its record, and
optional there like every other part (an old season may be remembered without one).
_UI copy_: Motto
_Avoid_: slogan, theme, title

**Motto stage**:
The staged presentation of the current session's **motto** — the club app's club hub opens with
it. It is a fresh piece of art each season, made to suit that season's motto and rebuilt from
nothing every November; it is not a picture the club uploads but something the club has made for
it, like the medal. Only the current session has one (decided 2026-09-18;
[ADR-0012](docs/adr/0012-the-motto-stage-is-code-the-session-logo-is-data.md)).
_UI copy_: Motto-Bühne
_Avoid_: hero, banner, header, treating it as the session's artwork (that is the **session logo**)

**Session logo**:
The small, still mark recorded on a **session record** — the emblem on the medal, the banner, the
anniversary booklet. It is evidence of a season exactly as the Nº is: recorded when the club has
one, absent when it does not, and never invented. It stands in wherever a season is named but not
staged — past seasons, lists, the public website. Renamed from **session signet** on 2026-09-20
(CA-P5 shaping): nobody outside design knows what a signet is, and the "session" prefix already
keeps it clear of the club's own logo, which is all the old name was protecting.
_UI copy_: Sessionslogo
_Avoid_: **signet** (retired 2026-09-20), logo (alone — that is the club's), artwork (in copy),
animating it, using it for the current season's opener

**Session record** (`Session`):
What the club has written down about one season: its Nº, its **motto** and its **session logo**.
**Every part but the year is optional** and nothing is ever inferred from a neighbouring record —
see **session** for why. A season with no session record is named from the date and nothing more
is said about it. The record is the *record*; the **chronicle** — a later, richer page telling a
season's story — is its presentation, and the two are never the same surface (named 2026-09-20,
CA-P5 shaping).
_UI copy_: Sessionseintrag
_Avoid_: chronicle (that is the presentation), season (the club's word is **session**), vintage

**Session medal**:
The medal the club strikes for each session; the Nº printed on it is the evidence the session
number rests on.
_UI copy_: Orden
_Avoid_: order (that is a ticket purchase), badge

### Events

**Event** (`Event`):
A ticketed hall evening of the session — the unit the club sells **tickets** for, and the only
thing the public website's event list shows. The German word is broader in everyday use; here it
is **narrow**: unticketed happenings (e.g. the Rose Monday parade) are not events in this sense
and are not listed on the website (the 2026-08-13 narrowing, carried over from the retired
"programme").
_UI copy_: Veranstaltung
_Avoid_: **programme** (retired — see flagged note), appointment (as the entity name), "Event" (in
German copy)

**Running order**:
The order of acts within a single event — a per-event ordering the club app manages. Not a list
of events. It is planned late: the responsible person assembles it roughly **two to three weeks
before** the evening, so for most of an event's public life there is no running order at all.
What the public website shows of it is the **order only, never times** — the sequence is stable
enough to publish, the clock is not.
_UI copy_: Ablauf
_Avoid_: **programme** (retired), setlist

**Calendar entry** (`CalendarEntry`):
One dated entry in the club's **one** calendar — the store that holds every club-related date
alike: events, unticketed club occasions, the members-only summer event, a group's training, a
group's performance. There are not several calendars that get merged for display; every surface
is a **filter** over this one store, so a group's dates are that calendar scoped to the group.
The word was the project's largest open block from 2026-09-10 until Florian settled it on
2026-09-18: it is the plain translation of *calendar entry*, nothing cleverer. An event is one
**kind** of calendar entry (`CalendarEntryKind`), not a synonym for it — event stays narrow (a
ticketed hall evening) and never widens to cover a training.

Every entry carries three independent things, never collapsed into one: its **owner** (the club,
or one group — who may edit it, and who a running entry summons through the Notice), its
**visibility** (`Group` / `Club` / `Public`, chosen when it is created; a group's training
defaults to `Club` so the club can see what the hall is doing) and its **venue**. Visible is not
the same as summoned: a training everyone can see still concerns only its group (decided
2026-09-19).

A fourth thing sits beside them and is never confused with the owner: the entry's
**participating groups** (`CalendarEntryGroup`) — who is expected there, many per entry (added
2026-09-21, CA-P6 shaping;
[ADR-0015](docs/adr/0015-a-calendar-entry-carries-participating-groups.md)). The gala session is
club-owned and the guard dances at it; without this the biggest date of a group's year is missing
from its own hub. Participating grants nothing: it never confers the right to edit the entry, and
it never summons the Notice — the owner alone does both. A group never lists itself as
participating on an entry it owns.

A calendar entry may optionally ask for an **attendance response** (`AttendanceResponse`, answers
yes / no / maybe) — per entry, switched on by whoever schedules it, and available for every kind
including a group's training (decided 2026-09-18). An entry that does not ask for one collects
nothing.
_UI copy_: Kalendereintrag; Eigentümer; Sichtbarkeit (Gruppe / Verein / Öffentlich); Mitwirkende
Gruppen; Zu-/Absage
_Avoid_: **appointment**, **group appointment**, schedule, calling it an event, collapsing
participating groups into the owner, participant (that is one person's attendance response),
guest group

**Venue** (`Venue`):
One of the club's few places — the sports hall, the clubroom, the storeroom. A club-managed list,
not free text on an entry: a **calendar entry** happens at a venue, and a **key holding** is held
for one. Because two entries at one venue at one time is a real collision, the venue is what
makes that collision findable (decided 2026-09-19).

A venue carries **its address** — street, postal code, city — and an optional **note** for what an
address cannot say („Zugang über den Hof“). It is written once here and read everywhere: a later
**event** names a venue, and the public website shows that venue's address rather than carrying
its own copy. The city field is **city** and never *venue* or *place*, because this domain already
spent that word on the place itself (German: *Stadt*, never *Ort*). A venue is **archived, never
deleted** — last season's entries still happened there (extended 2026-09-20, CA-P5 shaping).

**Capacity is not a venue's**: the club sells tickets for an *evening*, and one hall is laid out
differently for a gala session and a children's carnival — it belongs to the **event**, and it
waits on the open **seat allocation** question. Nor are **coordinates** (the address is the one
truth; a link is built from it) or a **public flag** (a venue is public exactly when a public
event happens there — derived, as ever, never stored).
_UI copy_: Ort; Straße, PLZ, Stadt; Hinweis
_Avoid_: room (too narrow — the sports hall is not the club's), location, place, free-text
places, **venue** as the name of an address's city field (that is **city**)

**Key holding** (`KeyHolding`):
A person's **dated period** of holding a key for a **venue** — the same shape as a role holding,
ended and never deleted, so who held a storeroom key two years ago is still answerable. Several
per person and per venue. It is a *fact*, not an inventory: **copies are not numbered and keys are
not counted** — the questions the club actually asks are "whom do I ask to unlock" and "whom do we
need to take one back from", and the holding answers both. Every member may see who holds what
(decided 2026-09-19).

**The counting that is forbidden is the club's.** No key count belongs on the club hub or in a
club statistic — there the club names holders, never a number. The **back office** counts, and
must: `/manage/keys` and its tile show how many handovers are currently running and to how many
persons, because handing one out and taking one back is the whole job of that screen (clarified
2026-09-20, CA-P5).
_UI copy_: Schlüssel
_Avoid_: key number, counting keys as a club statistic, access, access right (a key is metal, a
**permission** is a right in the app — never the same word)

**Live direction**:
Running an event's running order on the night itself: one operator advances the running order
and everyone else sees what is on stage now and who is next. It is the running order in its live
state, not a second ordering — the running order stays the one truth, live direction moves a
pointer through it. Confirmed as a real club domain 2026-09-08 (app-shell design handoff).
_UI copy_: Live-Regie
_Avoid_: direction (alone — too broad), show control, moderation

**Wardrobe**:
Club clothing the club orders and hands out — guard uniforms, softshell jackets, and the like:
what exists, who ordered what, and who currently holds it. Confirmed as a real club domain
2026-09-08 (app-shell design handoff).
_UI copy_: Klamotten
_Avoid_: clothing (too broad), merch (that is sold, this is issued), uniform (only one kind)

**Ticket**:
The unit the club sells for an **event** — one admission for one person. Price is flat within an
evening and differs between evenings. The word in every UI surface is **Karte**; the English
"Ticket" is banned in copy and labels (the masthead's "Tickets" chip was retired in E3 — the club
sells tickets, but the way in is the event list, so that is what the masthead names).
_UI copy_: Karte
_Avoid_: "Ticket" (in German copy), *Eintrittskarte* (in labels — too long), seat (that is the
seat, not the entitlement)

**Order**:
One purchase of one or more tickets by one buyer — the unit the checkout produces and the
confirmation mail refers to. A public buyer needs no account (guest checkout); an order is
retrieved via an unguessable token link (`orderCode`) sent by mail, never by a guessable number;
self-registering an account to keep orders is optional. Pinned 2026-08-18 (order-flow shaping).
_UI copy_: Bestellung
_Avoid_: "Order" (in German copy), cart (there is no persistent cart), booking

**Presale** (short **VVK** in copy):
The window in which tickets for an event can be bought, before the evening itself. An event's
public sales lifecycle is announced → presale announced → presale running → sold out / presale
ended. Not every event has a presale date from the start — it is announced when the club sets it.
_UI copy_: Vorverkauf (VVK); angekündigt / läuft / ausverkauft / beendet
_Avoid_: ticket sale, "Presale" (in German copy)

**Ticket exchange**:
The planned place where a ticket for a sold-out evening can change hands — the club's answer to
"sold out is not the end". **Its mechanics are undecided** (return flow, waitlist, who gets first
refusal), **and so are its values** (fixed price, club-run instead of private resale) —
assumptions, not club decisions (exchange shaping, 2026-09-01). The only confirmed fact is that a
ticket exchange is planned. The ticket-exchange page itself may present values and mechanics as
**clearly-framed plans in the making** — visibly labelled as in planning, nothing stated as
existing, decided or guaranteed (amended 2026-09-01); every other surface states only that it
exists.
_UI copy_: Kartenbörse
_Avoid_: exchange (alone — ambiguous), resale, secondary market

### Public communication

**News**:
The public website's news section — the chronological stream of **news posts**. Deliberately not
a blog: no tags, comments, author pages or search.
_UI copy_: Aktuelles
_Avoid_: blog, updates

**News post**:
One dated announcement in **news** — a short notice or report (the motto proclamation, a result,
a call for helpers). Carries exactly one **news category**.
_UI copy_: Meldung
_Avoid_: **fee** (German *Beitrag* means both a post and the membership fee — in this domain it
is only ever the fee), article, post

**News category**:
The one label a **news post** carries, from a fixed set. Label only — the public site offers no
filtering by it.
_UI copy_: Kategorie
_Avoid_: tag, section

### Internal communication

**Announcement** (`Announcement`):
A club announcement inside the club app, shown on the club hub — the digital notice board.
**Explicitly not a chat**: no replies, no threads, no reactions. It is **club-wide**; an
announcement meant for one group belongs in that group's hub, not here, which is what keeps the
club hub identical for every viewer (pinned 2026-09-18, CA-P3 shaping). **That second half is a
promissory note, not a built thing**: CA-P6 ruled on 2026-09-21 that the group hub gets no
announcements, so an announcement has exactly one scope today and a group has no way to tell its
group anything inside the app. Posting is a permission the club grants to whichever roles it
counts as board; reading one is not.

It carries a **title**, a **body**, its **author**, its date and an optional **valid until** — and
nothing else (settled 2026-09-19). Reactions, a news category, pinning and a **read receipt**
("read by 87") were each weighed and rejected: a notice board that scores its notices is a feed,
and the club has no rule that asks anyone to prove they read one. Whether an announcement is *new
to you* is answered by a single last-seen moment on the account, never by tracking each
announcement against each reader.
_UI copy_: Aushang; Titel, Text, Autor, Gültig bis
_Avoid_: notice (that is the shell's live-evening layer), news post (that is public website news),
message, chat, bulletin board, category, attachment, read receipt

### Photos

**Gallery** (`Gallery`):
The public website's photo section — a handful of curated **albums**, view-only. Deliberately not
an archive: no uploads, no downloads, no endless feed; each album shows a hand-picked selection,
not everything that was shot.
_UI copy_: Galerie
_Avoid_: **member photo library** (that is the club app's surface — see below), photo archive,
media library

**Member photo library**:
The **club app's** planned member-facing photo surface (upload + browse). Not built, and not the
name of the public page.
_UI copy_: Bildergalerie
_Avoid_: gallery (that is the public **gallery**)

**Album** (`Album`):
The curated photo set of exactly **one** club occasion (gala session, parade, season opening).
Not bound to the retired **programme** — an album may cover an unticketed occasion the event list
doesn't show. Carries its own date; its **session** is *derived* from that date, never stored.
_UI copy_: Album
_Avoid_: gallery (for a single album), folder, collection

### Money

**Fee**:
The yearly membership fee. It is **not** tiered by a membership type any more — the type was
retired 2026-09-10; what lowers it is a **fee reduction**, a dated fact on the person, and whether
a membership pause lowers it at all is an open club question (see flagged note). Nothing about the
fee is computed or billed anywhere yet.
_UI copy_: Beitrag
_Avoid_: dues, subscription fee, contribution

**Ledger**:
The single source of truth for all money movements (fees, shop, drinks till, tickets). Payment
providers (Stripe, PayPal, cash) are pluggable ways to settle ledger entries, never a parallel
truth.
_Avoid_: balance table, payments table (as source of truth)

## Flagged ambiguities

- **"Programme"** (German *Programm*) — **retired 2026-08-13.** The word was overloaded across the
  two apps (website: the season's ticketed events; club app: a per-event running order) and is now
  banned in both senses: the website's list of ticketed evenings is the **event list**, the club
  app's per-event running order is the **running order**. Shipped copy and identifiers still
  carrying the old word are renamed as part of the events-list page build, never left to drift.

- **Seat allocation** (German *Sitzplatzvergabe*) — **open, 2026-08-18.** The club has not decided
  how online sales assign seats: a fixed numbered seat per ticket (seating plan / seat picker) or
  general admission against a total count. Until decided, no public surface may claim either
  mechanic — the ticket-selection step ships as a recognisable placeholder, and copy says
  **Karten**, never *Plätze*, for the entitlement. The decision unblocks `page-seat-picker` and
  shapes `page-purchase`.

- **Group appointment** (German *Gruppentermin*) — **resolved 2026-09-18.** A group's own dates
  were flagged as nameless on 2026-09-10 and reframed on 2026-09-17 by the one-calendar ruling:
  the club never needed a word for *a group's dates*, it needed one for **an entry in the club
  calendar**. Florian settled it on 2026-09-18 by translating it — **calendar entry**, see the entry
  above. This unblocked the calendar page, the club hub's calendar panel and the group hub's dates
  panel, which were the project's largest single block.

- **Entry check** (German *Einlasskontrolle*) — **open, 2026-08-19.** The club has not decided how
  entry is checked at the door (QR scanning per ticket, a name list, no check at all). Until
  decided, no public surface may show or promise a scannable code, a PDF ticket or a wallet pass —
  the digital ticket's face is exactly as undecided as the door practice it would serve. The order
  confirmation shows the purchase honestly without codes. The decision shapes `page-purchase`'s
  ticket display and the eventual event-app scanner.

- **Guest registration & duplicates** — **open, 2026-08-18.** Self-registration can create a
  second person for a human already in the registry (a member without account buys tickets
  online). The merge/claim mechanism (e.g. an invitation claiming an existing self-registered
  account by mail match, or an admin merge) is undecided — to be resolved when accounts are
  actually built (club-app/backend territory).

- **Fee during a membership pause** — **open, 2026-09-11.** Whether a member pays while her
  membership is *paused* is a club question nobody has answered. Until it is, no copy may say a
  membership pause costs nothing: it is described by what it does to the state (from that session
  on she does not count as active), never by what it does to the fee.

- **Non-member group people have no name** — **open, 2026-09-03.** People in a group without
  membership are now a supported, first-class case (see **group**), but the club has no canonical
  word for them yet ("externals"? "group member without club membership"?). Until the club names
  them, UI copy avoids inventing a term. Club-side to-do carried with this: confirm the club's
  insurance covers non-member group participants — if it only covers members, that gap is a club
  decision, not a software one.

- **Who decides a photo is public** — **open, 2026-07-28.** No rules exist yet, and it is not
  settled whether any of this gets built. The public **gallery** needs none of it today: it shows
  the pictures the club put into it, and the only real-world remedy is the takedown contact printed
  on the page. Two *candidate* senses have surfaced, from the club-app handoff, and they are not the
  same thing — if this is ever modelled, do not collapse them into one `is_public` flag: a
  **per-photo** release ("release for website") is about *photos*, while a **person**-level consent
  to being photographed at all is about *people*. Neither implies the other. Until someone actually
  decides, neither term is canonical language.

- **Membership type "passive"** — **retracted 2026-07-29.** The 2026-07-16 note declared the
  handoff's four types (active / passive / youth / honorary) authoritative and added `passive` to
  the DBML enum. The domain expert overturned that during P6 shaping: **passive was never a type**
  — it was the word for a membership that *pauses for a session*, which is a **status**. Type was
  then active / youth / honorary and status was active / **paused** / ended;
  `docs/design/FCC-Schema.txt` was corrected accordingly (`passive` removed from `membership_type`,
  `inactive` → `paused` in `membership_status`). **Lesson:** the earlier note resolved the
  ambiguity from the *handoff* rather than from the club.

- **Membership type** — **retired 2026-09-10.** Layer A is the membership itself and the type is
  gone: **a membership is a dated period, and a period has no kind**. The three values the note
  above pinned were redistributed — *active* is the derived state, *youth* is a **fee reduction**
  on the basis *minor*, *honorary* is the **honorary membership**, an honour that runs alongside.
  `MembershipType` and `MembershipStatus` are deleted outright and the status is no longer stored
  either; no surface, chip or filter may name a type again. This supersedes the "passive"
  retraction above, which settled the type it now retires.

- **Honorary membership** (German *Ehrenmitgliedschaft*) — **removed from CA-P1 2026-09-11.** The
  honour the club confers is real and it is **not** a kind of membership — it runs alongside one,
  and an honorary member is **not published on the public website**. It is nevertheless **owed to
  a later phase**: nothing is modelled, nothing is conferred in the app, and until it is, no
  surface carries an honorary-member marker, seal or filter — the design mocks that showed one are
  ignored for exactly that reason.

## Example dialogue

> **Dev:** Lisa logs in and can edit the dance guard's calendar — is she on the board?
> **Expert:** There is no board right. She's a person with an account, her membership is running,
> and someone made her group admin of the dance guard with the function "Trainerin" — that is
> scoped to exactly that group.
> **Dev:** And her grandfather in the registry who never logs in?
> **Expert:** A person with an honorary membership and no account. If he ever wants the app, the
> managing director prints him an invitation.
