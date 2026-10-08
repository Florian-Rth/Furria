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
| membership application / admission | Beitrittsantrag / Aufnahme | `MembershipApplication`, — |
| role / permission | Rolle / Berechtigung | `Role`, `RolePermission` |
| role holding / holder | Inhaberschaft / Inhaber | `RoleHolding` |
| board / board office / board seat | Vorstand / Vorstandsfunktion / Vorstandssitz | `BoardOffice`, `BoardSeat` |
| contact details | Kontaktdaten | — |
| portrait | Porträt | — |
| account / invitation | Account / Einladung | `Account`, — |
| passkey | Passkey | `account_passkey` (Identity) |
| access recovery | Zugang wiederherstellen | `InvitationPurpose.Recovery` |
| adoption / claim-in | Diese Person übernehmen / — | — |
| club | Verein | — |
| club hub / group hub / management | Verein / Gruppe / Verein verwalten | `club`, `group-hub`, `manage` |
| events workbench | Veranstaltungen | — |
| tile | Kachel | — |
| Start / to-do / seen mark | Start / Zu erledigen / Gesehen | `start`, `ToDoKind`, `ToDoMark` |
| active in the club | im Verein aktiv | — (derived) |
| her dates: concerns / runs / expected | — | `CalendarTies` |
| session ordinal | „deine 13. Session" | `SessionOrdinal` |
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
| online sales / ticket request | Online-Kartenverkauf / Kartenanfrage | — |
| presale | Vorverkauf (VVK) | — |
| ticket exchange | Kartenbörse | — |
| news / news post / news category | Aktuelles / Meldung / Kategorie | `NewsPost`, `NewsCategory` |
| lead post (the news post opening the page) | Aufmacher | `NewsLead…` |
| announcement | Aushang | `Announcement` |
| gallery / album | Galerie / Album | `Gallery`, `Album` |
| media store / media item | — | `MediaItem` |
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
| women's carnival day | Weiberfastnacht | | Rose Monday | Rosenmontag |
| carnival Tuesday | Fastnachtsdienstag (its night: Kehraus) | | | |

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
Carries no account and no invitation (see **account**: member ≠ account). Only someone who has
reached the club's **age of consent** applies, and for herself — no guardian applies on a child's
behalf; a younger child joins by asking the club, which records her by hand. It reaches the club
only once its sender **confirms** it from the inbox she gave — an unconfirmed one is gone after 48
hours. A confirmed application **lives only until it is decided**: an **admission** carries its details into the registry, a
decline — which also disposes of spam and withdrawals — deletes it, and an undecided one waits
until someone decides (ruled 2026-10-02, L4 shaping).
_UI copy_: Beitrittsantrag; *Antrag bestätigen*; *Ablehnen*
_Avoid_: sign-up, registration, application (alone), calling the sender a member

**Admission**:
The club's decision to accept a **membership application**, dated by its **admission date** —
never before she applied, and possibly still to come. Deciding applications is a **permission** of its own, apart from person
management: its holders see the applications, are told when one arrives, and admit without
needing any other right. An admission opens her **membership** from the admission date — on a new
**person**, or on the one the registry already holds for her: whoever admits her is shown every
person sharing her email, or her name and birth date, and decides which, if any, she is; nothing
is matched on its own. On an existing person the application only fills what the registry lacks,
and a former member keeps her *Mitglied seit*; someone whose membership is running cannot be
admitted again. Whoever admits her also invites her, in the same act, **when she is eligible
that day**; otherwise she is invited like anyone else once she is. An applicant who is **under 18
on the admission date** cannot join on her own word: whoever admits her first confirms that her
guardian has consented, and that confirmation is recorded with its author (ruled 2026-10-02, L4
shaping). The admission is recorded on the membership it opens — when, by whom, and whether a
minor's consent was confirmed — and outlives the application (built 2026-10-02, L4 S5).
_UI copy_: Aufnahme; *Aufnehmen*; *Aufnahmedatum*; *Das ist sie*; *Neue Person*; *ist bereits
Mitglied*; *minderjährig*; *Einwilligung der gesetzlichen Vertretung liegt vor*
_Avoid_: approval, confirmation, onboarding, calling the admission date "joined" before it arrives,
**adoption** (that is the unaffiliated-duplicate rule; an admission may land on any person)

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
nothing, and the two are never unified (decided 2026-09-19). An office may be **public**: whoever
holds a running seat in it appears on the public website with name, office and **portrait**. Off
by default, a setting of the office, never of the person; with no public office held, the website
shows no board at all (ruled 2026-10-02, L5 shaping).
_UI copy_: Vorstandsfunktion; *Auf der Website zeigen*
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
hidden is a setting, never a gap (pinned 2026-09-10, CA-P1 fresh shaping). **A person with an
account keeps her own contact details** — she edits phone, address and contact email herself, and
the change shows who made it and when; her name and birth date stay with the club, because they
are who she is, not how to reach her (ruled 2026-09-25, accounts shaping). **Only an actual
change counts as a change**: saving the values that were already there records nothing. The last
change is shown with its actor and day — *Kontaktdaten geändert von Anna am 3. Okt.*, or *von dir*
when she made it herself (built 2026-09-26, CA-P8 S8). The latest change with its actor is all
the club keeps — there is no per-field history (ruled 2026-09-27). A person invited in person
without a contact email gets the login email she confirmed as her contact email, stamped as her
own change (built 2026-09-27).
_UI copy_: Kontaktdaten (Telefon, E-Mail, Adresse); *Kontaktdaten geändert von Anna am 3. Okt.* ·
*von dir*
_Avoid_: contact (as a field name), showing hidden contact details as missing data

**Portrait**:
The **one** picture a person has in the platform, in rectangular portrait format — her profile
picture in the app, and the same file shown in the round wherever a list needs an avatar. A
portrait is **provided, never taken**: the person hands it over to be shown, and that act is the
consent — which is why it is untouched by the open question about event photography. It is
**public exactly while she holds a seat in a public board office** and nowhere else; there is no
per-person switch (ruled 2026-10-02, L5 shaping — reverses the 2026-09-19 "a switch she owns,
never flipped by a board seat").
_UI copy_: Porträt
_Avoid_: photo (that is event photography — a different question entirely), avatar (that is how
a portrait is *displayed*), a second picture for the website, a per-person publication switch

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
([ADR-0005](docs/adr/0005-auth-aspnet-identity-bearer-tokens.md)). The **login email** is the
account's own and is distinct from the email in her **contact details**: it starts as a copy of
it, and when *she* changes her login email the contact email follows unless she says otherwise —
but nobody else's edit of her contact details ever touches her login, because that would let
whoever keeps the registry take her account over (ruled 2026-09-25). Two persons may share a
contact email; never a login email. She signs in with her **password**, always available, or
with a **passkey** (*Mit Fingerabdruck anmelden*) she may add on any of her devices — the passkey
is a convenience on top, never a replacement (ruled 2026-09-25). **An account outlives
affiliation**: when her last running relationship ends, her keys fall away by derivation and the
account stays, showing her that she is no longer active in the club — the **nicht im Verein
aktiv** state: every club surface gives way to that one screen, and her profile stays reachable
from it. Rejoining lights it up again without a new invitation (ruled 2026-09-25). **Only she deletes her account**; her person and
everything the club recorded about her stays, and she can return through a new invitation. The
club never deletes an account — it **disables** one, reversibly (ruled 2026-09-25); the one way an
account goes without her is **person deletion**, which takes everything (ruled 2026-10-07). Deleting
takes her password again, keeps her person with everything the club recorded, and voids any live
invitation of hers; nobody disables her own account (built 2026-09-26, CA-P8 S5/S6).
Everything about her login is hers, under **Anmeldung & Sicherheit** on her profile: login email,
password, **Überall abmelden** — which ends every session, *this device's included* — and
*Account löschen* (built 2026-09-26, CA-P8 S6).
**The MVP has no child
accounts** (ruled 2026-09-21, CA-P6 shaping): nobody under the club's own age of consent gets a
login, and no account is held on another person's behalf. A child in the children's guard is a
person with a group membership and no account, exactly like a member who never asked for the
app — so no surface may assume the dancer is the one reading it.
_UI copy_: Account; *nicht im Verein aktiv*; *Anmeldung & Sicherheit*; *Überall abmelden*;
*Account löschen*; *Kontakt-E-Mail ebenfalls ändern*
_Avoid_: user (as a table/entity name), guest account (it is the same account concept),
username

**Managing login**:
The one **account** with no person: the club's way in, configured wholly by the server's
environment (login email and password) and brought in line with it on every start — recreated
when gone, the same account following a changed email. It holds every **permission** by itself,
without a **role**, and no relationship: it manages the club, it does not take part, so it sees
Start and the club management and never *nicht im Verein aktiv*. Nothing in the app shows it —
no register row, count, picker or role holder — and where it acts on someone's record the act
names nobody. Its login is not editable in the app: no login email, password, passkey or
*Account löschen*; only signing out. Persons made admin-like by the club hold the seeded *Admin*
role instead, which every start keeps granting every key (ruled 2026-10-07,
[ADR-0022](docs/adr/0022-the-bootstrap-admin-is-a-personless-managing-login.md)).
_UI copy_: — (it is never named)
_Avoid_: bootstrap admin (the retired person-backed account), super user, root

**Passkey**:
An optional second credential on her **account**, held by one of her devices and unlocked by her
fingerprint or screen lock (*Mit Fingerabdruck anmelden*). **The password always stays**: a
passkey is added on top, never in its place, and removing her last passkey leaves her exactly
where she started. She may hold several, one per device, each named by her or by default
*Passkey vom 26. Sep. 2026*; adding or removing one tells her login email. A passkey also proves
it is her where the password would — deleting her account, claiming in — and the password
lockout never blocks it, because a passkey cannot be guessed; a disabled account stays shut
either way (built 2026-09-26, CA-P8 S7).
_UI copy_: Passkey; *Mit Fingerabdruck anmelden*; *Passkey hinzufügen*; *Passkey entfernen*;
*Mit Passkey bestätigen*; *Mit Fingerabdruck bestätigen*
_Avoid_: biometric login (the fingerprint never leaves her device), security key, second factor
(it replaces the password for that sign-in, it does not add to it)

**Account state**:
What the club sees about a person's access. The state itself is derived, never stored: *no access* (with the reason
she cannot be invited, when she cannot: under age, birth date missing, not affiliated),
*invited* (an invitation is live), *active*, or *disabled*; plus the history of who invited,
reminded, recovered or disabled her, and when. **The club never sees when she last signed in** —
access is recorded, use is not (ruled 2026-09-25).
The persons register, filtered by access, shows the same state on each row — plus *nicht
einladbar* for no access with a reason — and there an active account reads *Account aktiv*, so it
is never mistaken for an active membership (built 2026-09-27).
_UI copy_: *kein Zugang* · *eingeladen* · *aktiv* · *gesperrt*; in the register *Account aktiv* ·
*nicht einladbar*
_Avoid_: last seen, activity (as something the club watches)

**Account eligibility**:
Whether a person may be given an **account** — derived at the moment it is asked, never stored:
she is **affiliated**, has no account yet, and has reached the club's **age of consent** (kept on
the **club record**, 16 unless the club says otherwise). A person with **no recorded birth date** can be
invited only by someone in the club, who vouches for her age by doing so; she can neither request
her own invitation nor be reached by a bulk invitation (ruled 2026-09-25, accounts shaping).
That act is **the vouch**: a holder of the access-recovery right invites her by hand, the
invitation's issuer is recorded as the one who vouched, and redeeming it never asks for the birth
date again (built 2026-09-26, CA-P8 S5). **An email is not part of eligibility**: without a
contact email she is still eligible, but only the in-person channel reaches her — no mail
invitation, no bulk invitation, no reminder, no self-request; she types her own login email while
redeeming and confirms it by code (ruled 2026-09-27, Florian: the club has many older members).
_UI copy_: — (surfaces say what she can do: *kann eingeladen werden*); the vouch: *Geburtsdatum
bestätigen*, *Du bestätigst, dass Anna mindestens 16 ist.*; without email: *nur vor Ort
einladbar*
_Avoid_: storing an "invitable" flag, treating an unknown birth date as either adult or child

**Invitation**:
A one-time onboarding token that lets a person create their account. It reaches her one of two
ways: **by mail** to the address the club has on record, or **in person** — a QR and a short code
on a manager's screen, alive for minutes. Nothing is printed (ruled 2026-09-25).
It is issued by the club **or requested by the person herself**: asking with the email address
the club has on record sends an invitation to that address, and **control of that inbox is the
proof** — no one in the club approves it (ruled 2026-09-25, accounts shaping). Who redeemed it,
and when, stays visible on the person. When several eligible persons share that address, the
request invites each of them — whoever reads a shared inbox is entitled for everyone it serves,
and the first to redeem takes the address as her login email. That request, **Zugang
anfordern**, is an invitation on the request channel with no issuer: one mail per inbox, carrying
one link per eligible person, and at most one such mail per inbox every five minutes; the answer on
screen is the same whether or not the address matched (built 2026-09-26, CA-P8 S3). The club's invitations are
**never sent by the system on its own** — someone decides, for one person or for everyone
eligible at once (**bulk invitation**, *Alle einladen*). A bulk invitation reaches only those
**never invited**; nudging someone who let hers lie is a separate, deliberate act (**reminder**, *Erinnern*), so
pressing the button twice never mails the same person twice. A person has **at most one live
invitation**: a new one, by any channel, voids the one before; each lives as long as its channel
warrants (a mail for days, a code on a manager's screen for minutes). A **group admin** issues
none — accounts are the club's business, never a group's (ruled 2026-09-25).
**Never invited** means she has never been sent an onboarding invitation at all, by any channel.
An **offene Einladung** (open invitation) is a live onboarding invitation of a person who still
has no account — neither redeemed nor voided, **expired or not**: an expired one was issued and
never answered, which is exactly whom a reminder is for (built 2026-09-26, CA-P8 S4).
_UI copy_: Einladung; *Zugang anfordern* (the person's own request); *offene Einladung*;
*Per Mail einladen*; *Vor Ort zeigen* and *Code eingeben* (the in-person short code)
_Avoid_: sign-up, registration

**Bestätigungscode** (confirmation code):
A 6-digit code mailed to a login email she chose herself, proving she controls that inbox. It
lives 15 minutes and dies after 5 wrong tries; a new one voids the one before (built 2026-09-26,
CA-P8 S2).
_UI copy_: Bestätigungscode (the mail); *Code aus der Mail* (the field)
_Avoid_: PIN, OTP, calling the in-person short code a confirmation code

**Access recovery**:
A one-time token, handed out by the club, that sets new credentials on an **existing** account —
for someone who lost both her password and her mailbox. It is the invitation's mechanism with a
different target, and a **separate right** from inviting: whoever can recover an account can take
it over, so the right to invite (harmless — there is no account yet) never implies it. Disabling an
account and vouching for an unknown birth date sit with the same right (ruled 2026-09-25). It is
**handed over in person only** — shown on the club's screen — never sent to an address
someone names on her behalf, and her previous login email is told it happened. If she picks a
new login email while recovering, it is confirmed by code and her contact email follows unless
she says otherwise — exactly as when she changes it herself (built 2026-09-26, CA-P8 S5).
Forgetting a password is **not** access recovery — she resets it herself by mail
(*Passwort vergessen*); a reset ends every session and does not sign her in.
_UI copy_: Zugang wiederherstellen; *Wiederherstellung gestartet* (the history line)
_Avoid_: password reset (that is the self-service path), re-invitation

**Adoption** / **adoption candidate**:
The person editor's answer to a duplicate before it exists: when the club records an email that
belongs to a person with no affiliation, that person is the **adoption candidate**, and adopting
her opens her record instead of creating a second — nothing is merged or written
([ADR-0019](docs/adr/0019-duplicate-persons-are-adopted-not-merged-by-hand.md), built 2026-09-26,
CA-P8 S9). An affiliated person is never a candidate.
_UI copy_: *Diese Person übernehmen*
_Avoid_: merge, duplicate check (as something the club runs)

**Stray person** / **claim-in**:
A **stray person** is a person with no affiliation whose account's login email is the one an
invitation is being redeemed with — the same human, recorded twice. **Claim-in** closes it on her
word: redemption asks her to sign in with that account, and signing in moves the account onto the
club's person, which absorbs the stray one; she proves it with that account's password or one of
its passkeys, and the claimed account keeps its login email, password and passkeys. **Club data blocks the absorption**: a stray person holding any of it (a membership,
even an ended one) makes the address simply taken — her history is never absorbed, because that
risks overlapping memberships (built 2026-09-26, CA-P8 S9; ruled 2026-09-27). A recovery never
claims in.
_UI copy_: — (redeem asks her to sign in with the existing account)
_Avoid_: merge, account linking

**Person deletion** (`persons.delete`):
Erasing a person for good: her record and every chain about her — memberships, group
memberships, role holdings, board seats, key holdings, her account and its invitations, her
attendance responses — are gone. Nothing is anonymised and kept, because in a club this size an
anonymous history still names her. Where she acted on someone else's record (an announcement she
wrote, an admission she made, an invitation she issued, a contact change she made) the act stays
and names nobody — no *von …*, exactly like an act of the **managing login**. It is the one
exception to "ended, never deleted", cannot be undone, and is a **permission** of its own, apart from person management, which only archives — it
reaches the register and a person's screen on its own, as the access-recovery right does. It
is possible **at any time**, whatever still runs — she need not be archived first, and a holder
may delete herself; its
confirmation names everything still running, so a key never vanishes unseen, and the one deleting
proves it is her with her password or a passkey, exactly as deleting her own account does. A
person with an account is told at her login email, and her sessions end; one without is told
nothing — whoever answers an erasure request confirms it herself. The club keeps **no trace** that
she was deleted: a trace naming her would keep what was erased. The one thing deletion spares is a
money record the law obliges the club to keep — it stays until its retention period ends, and the
**ledger** inherits that rule (ruled 2026-10-07,
[ADR-0021](docs/adr/0021-a-person-is-erased-never-anonymised.md)).
_UI copy_: *Person löschen*
_Avoid_: anonymising, soft delete, archiving (a different act)

**Archived person**:
A person the club has filed away, record whole — the person-management counterpart of
**deletion**. Only a person who is not **active in the club**, holds no running **key holding**
and has nothing of either dated to begin later can be archived: archiving ends nothing, so
whatever still runs is ended first, each on its own date. She leaves the register's default view
and every picker that opens a chain, but **admission** matching and the **adoption candidate**
still find her — a former member who returns is exactly who they are for. Archived and running
exclude each other: opening any chain on her lifts the archive by itself — so does restoring the
group, role or office an open tie of hers sits in — and her own screen restores her by hand.
While she is archived her history is closed: an ended membership, a membership pause or a fee
reduction cannot be recorded or corrected on her until she is restored. Her **account** is untouched — it is hers,
and already shows *nicht im Verein aktiv*. Her screen says when and by whom she was archived;
only the latest archiving is kept, and restoring clears it. Archiving is the club's decision that
she is done, not a state — *nothing running* is derived, *archived* is chosen — so it happens one
person at a time on her own screen: never in bulk, never a **to-do** (ruled 2026-10-07).
_UI copy_: *Archivieren*; *Archiviert* (the register filter); *Archiviert von Anna am 7. Okt.*;
*Wiederherstellen*
_Avoid_: deactivated, inactive (that is **active in the club**, derived), deleting

### Club app structure

**Club** / **club hub**:
The club itself (German *Verein*) and the club app's hub for it — the one screen that is
identical for every viewer ([ADR-0010](docs/adr/0010-club-app-is-a-set-of-scope-hubs.md)).
**Group hub** is the same idea scoped to one group; **club management** (`/manage`, the back
office) is where the club's records are written. A **tile** is one entry card on a hub.
_UI copy_: Verein; Gruppe; Verein verwalten; Kachel
_Avoid_: association, society, admin area (for club management)

**Events workbench**:
The administrative hub for the club's **events**, beside club management
([ADR-0010](docs/adr/0010-club-app-is-a-set-of-scope-hubs.md)): the session's events and, per
event, its own page, where later the running order, seats and presale join its key facts — the
same hub growing, never replaced (ruled 2026-10-07, L6 shaping).
_UI copy_: Veranstaltungen
_Avoid_: event hub, event admin, a management page for events

**Club record**:
The club's own facts about itself — there is exactly one, kept in three sections, each written on
its own: **name & founding** (official name as registered, short name, **founded year**),
**address & contact** (address, email, phone, website and social links — what the imprint and
every "reach the club" place show) and **access** (the **age of consent**, the age from which a
person acts for herself on the platform — holds an account, sends a **membership application** —
16 unless the club says otherwise; widened 2026-10-02, L4 shaping). Written in club management, read
wherever the club describes itself (ruled 2026-09-25, accounts shaping; widened the same day).
_UI copy_: Vereinsdaten; *Name & Gründung*; *Anschrift & Kontakt*; *Zugang zur App*;
*Vereinsname*; *Kurzname*; *Gründungsjahr*; *Mindestalter für App und Online-Antrag*
_Avoid_: settings (it is the club's record, not an app's configuration)

**Start**:
The club app's hub for *me, now* — the one hub that varies per viewer, and the default first
destination ([ADR-0010](docs/adr/0010-club-app-is-a-set-of-scope-hubs.md)). Built in L2
(`plan/launch/l2-start-hub.md`): a split-flap **greeting** that says where her season stands in
her own terms („40 Tage bis zu deiner 13. Session, Lena.") and a column of **panels, one per kind**
— her dates, the Aushänge new to her, what is new on her own record, her groups' jubilees, and
club work — each one fact line per item, detail in sheets. Which panels exist, their order and
their caps are decided by the server per viewer and moment; an empty panel is absent, never
zero. Nothing on Start is dismissed by hand: every item ends by itself — the one thing Start honours from
elsewhere is a to-do **marked seen** where its work is done (ruled 2026-10-06, L3). A **frozen visit**: after
her first touch nothing on Start is added, removed or reordered — it only changes state in place;
device memory may only quiet, never add (ruled 2026-10-02, L2).
_UI copy_: Start (nav, the first default destination since L3); panels KALENDER · AUSHÄNGE · DU · GRUPPEN · ZU ERLEDIGEN;
Zusage · Vielleicht · Absage, always in this order
_Avoid_: dashboard, feed, inbox, „Termin", „Programm"

**Her occasions**:
Her own birthday and the anniversary of her joining are hers to see on Start; nobody else's
occasions are shown anywhere. A round join anniversary (a multiple of 5 or 11 years) stays on
Start for 30 days after the day. The **session ordinal** — „deine 13. Session" — counts the
sessions in which her membership ran and was not paused (`SessionOrdinal`) (ruled 2026-10-02, L2).
_Avoid_: other people's birthdays or anniversaries, age

**New on her record**:
A role, board seat, group-admin tenure, group membership or key holding is *new* on Start for 14
days from its own since date; a change of her contact details by someone else stays for 14 days.
New is read from the domain's own dates, never from when a record was typed in — which is why the
rollout enters true since dates (ruled 2026-10-02, L2).

**Active in the club**:
Affiliated, or holding a running **group admin** tenure in a non-archived group, or a running
**board seat** in a non-archived office — derived, never stored. It differs from **affiliated**,
which governs reading the club: *active* decides only Start's *nicht im Verein aktiv* state and
whose keys must come back, so a trainer who is not a member keeps her Start and her hall key
(ruled 2026-10-02, L2).
_UI copy_: *nicht im Verein aktiv*
_Avoid_: using it for permissions, storing it

**To-do** (`To do`):
One piece of the club's work waiting on the viewer **because of a permission she holds** — open
invitations for whoever manages accounts, say. Derived, never stored: it exists while the state
behind it is unresolved and is gone the moment it resolves. The same item shows in its admin hub's
To-do panel (where the work is done) and on **Start** (where it is discovered). It is never
personal: what she owes as a person (an **owed response**) is not a to-do (ruled 2026-10-01, L2
shaping). Start shows a to-do as a **count, never names**, and each count lands where the work is
done. The contract is `ToDoService` / `ToDoKind` (built in L2); the kinds at launch and their
gates (ruled 2026-10-02, L2):

| Kind | UI copy | Gate |
|---|---|---|
| never invited | *nie eingeladen* | `persons.manage` |
| reminder due (invitation open > 3 days) | *Erinnerung fällig* | `persons.manage` |
| in person only (eligible, no email) | *nur vor Ort einladbar* | `persons.manage` |
| birth date unknown (affiliated, no account, no birth date, no open invitation) | *Geburtsdatum fehlt* | `persons.manage` ∧ `accounts.manage` |
| key to take back | *Schlüssel zurückholen* | `key_holdings.manage` |
| club record gap | *Lücke in Vereinsdaten* | `club.manage` |
| application waiting (confirmed, undecided **membership application**; added in L4) | *Beitrittsantrag offen* | `membership_applications.decide` |

A to-do can be **marked seen** in its admin hub's To-do panel (*Zu erledigen*) — per account, on
every device (ruled 2026-10-06, L3). The mark covers the items behind the to-do at that moment:
- A to-do whose items she has all seen folds into the panel's *Gesehen · n* line, always openable,
  and is left out of Start.
- An item the mark did not cover is **new**: the to-do stays in the fold with an *n neu* chip (on its
  row and on the fold line) and is back on Start. Items resolving never bring it back.
- A mark none of whose items remain is spent — the to-do is unmarked again.
- Marking is exact: when the items changed since the panel showed them, the mark is refused and the
  panel reloads, so nothing is marked seen unseen.

_UI copy_: *Zu erledigen*, *Gesehen · n*, *n neu*
_Avoid_: task (that is the event planner's), notification, inbox, names in a to-do, *erledigt* for a
seen to-do (seen is not done)

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
flip. What a surface *advertises* is the **relevant session**: the running one, and from the day
after Ash Wednesday the coming one — the club hub and the public website name the same season
(ruled 2026-10-02, L5 shaping).

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

An event is a **calendar entry** of the kind *event* and is **always public** — its visibility is
not chosen. Public is not the same as event: a public calendar entry of another kind (the Rose
Monday parade) stays off the website. An event is kept, whole, in the **events workbench** —
its date and venue as much as what the website says about it — and nowhere else (ruled
2026-10-07, L6 shaping).
_UI copy_: Veranstaltung
_Avoid_: **programme** (retired — see flagged note), appointment (as the entity name), "Event" (in
German copy), **public event** (an event is public by definition; "public" alone is a visibility)

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
nothing. An **owed response** is an entry that asks for one, concerns
her and has not yet started, which she has not answered (*vielleicht* is an answer) — personal,
answered in place on **Start**, never a **to-do**. An entry **concerns** everyone with a running
membership when the club owns it, and the current members of its owner group and of its
participating groups when a group owns it — never a group admin for being one. Anyone who can see
an entry may still answer it; *owed* only decides what Start asks for (ruled 2026-10-02, L2
shaping).

Made precise when L2 was built (ruled 2026-10-02):
- **Visibility.** A *Group*-visible entry is visible to the running members and admins of its owner
  group **and of its participating groups**. An archived group confers no concern, no running and
  no sight.
- **Answering.** She may answer an entry she **sees** on one of her surfaces: she holds `club.read`
  or a tie to its owner or a participating group, and its visibility admits her. Concern always
  grants answering; a past entry stays answerable.
- **Pause.** A club-owned entry does not concern a member whose membership is paused for that
  entry's session.
- **Her dates.** An entry is one of her dates when it concerns her, when she **runs** it — she holds
  a running group-admin tenure in its owner or a participating group, shown with her function — or
  when she is **expected** at it: a club-owned entry in which a group she is a current member of
  participates. Running and expected never make a response owed. An *Absage* takes an entry off
  Start.
- **Owed horizon.** Start asks from 14 days before a training, rehearsal or meeting and from 42
  days before any other kind. The horizon limits what Start asks, not what is owed.
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

A **key to take back** is a running key holding of a person who is no longer **active in the
club**; it is a to-do for whoever holds `key_holdings.manage` and carries the chip *nicht im Verein
aktiv* in `/manage/keys` (ruled 2026-10-02, L2).
_UI copy_: Schlüssel; *Schlüssel zurückholen*
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

**Online sales**:
Whether an **event**'s tickets can be bought on the website — a channel, chosen per event, never a
synonym for **presale** (an event without online sales still has a presale, just not on the web).
An event without online sales takes **ticket requests** instead (ruled 2026-10-07, L6 shaping).
_UI copy_: Online-Kartenverkauf
_Avoid_: online presale (presale is the window, not the channel)

**Ticket request**:
A guest's request, sent from the website, for a number of **tickets** to one **event** that has no
**online sales**. It is **not an order** — nothing is paid, reserved or issued — and it is answered
outside the app (phone, WhatsApp), where the guest gets her physical tickets. A ticket request
**lives only until it is handled**: handling it deletes it, and the club keeps no list of who
asked (ruled 2026-10-07, L6 shaping).
_UI copy_: Kartenanfrage
_Avoid_: order, reservation, booking, ticket order

**Presale** (short **VVK** in copy):
The window in which tickets for an event can be bought, before the evening itself. An event's
public sales lifecycle is announced → presale announced → presale running → sold out / presale
ended. Not every event has a presale date from the start — it is announced when the club sets it.
_UI copy_: Vorverkauf (VVK); angekündigt / läuft / ausverkauft / beendet
_Avoid_: ticket sale, "Presale" (in German copy)

**Ticket availability**:
How many tickets an event **without online sales** still has, in the club's rough words —
*available*, *few left*, *sold out* — set by hand once its **presale** has begun; before that the
presale date alone speaks. The date decides *when*, the person decides *how much*, so the two never
contradict (ruled 2026-10-07, L6 shaping). **Cancelling** an event is not an availability: it is
the event's own act, whatever its channel.
_UI copy_: Karten verfügbar / Nur noch wenige Karten / Ausverkauft; *Abgesagt*
_Avoid_: free count, stock, capacity (those are counted, this is said)

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
announcement against each reader. Opening the new Aushänge — on Start or on the board — moves that
moment to the newest announcement shown, never backwards and never past now; Start lists an
announcement as new for at most 60 days and never one she wrote herself (ruled 2026-10-02, L2).
_UI copy_: Aushang; Titel, Text, Autor, Gültig bis
_Avoid_: notice (that is the shell's live-evening layer), news post (that is public website news),
message, chat, bulletin board, category, attachment, read receipt

### Photos and videos

**Media store**:
The platform's one store for uploaded pictures and videos, with no screen of its own. It holds
**media items**; every use (a **portrait**, a **group picture**, the **gallery**) owns its items.
_Avoid_: media library, file store, uploads (as a noun)

**Media item** (`MediaItem`):
One uploaded photo or video together with everything derived from it. It has **exactly one
owner** — a person (her **portrait**), a group (its **group picture**) or the **gallery**. Using
one owner's picture for another *copies* it into a new media item, so a takedown or deletion in
one use never breaks another.
_Avoid_: file, asset, attachment, media (as a countable noun)

**Gallery** (`Gallery`):
The club's collection of photos and videos, organised in **albums** and kept in the club app.
**Published** albums are its **public face** on the website — one gallery, not two: the website
page is a view of it, not a separate thing. Replaces the retired *member photo library*
(2026-10-08, L7a shaping).
_UI copy_: Galerie
_Avoid_: member photo library, photo library, media library, photo archive

**Album** (`Album`):
Everything the **gallery** holds of exactly **one** club occasion (gala session, parade, season
opening) or one theme (*Archiv Session 1985*) — every photo and video, not a selection. Not bound to the retired **programme** — an
album may cover an unticketed occasion the event list doesn't show. **It has no date of its
own** (ruled 2026-10-08, L7a shaping): it is linked to a **calendar entry** — its date and session
come from the entry — or, for what the calendar never held (*Archiv Session 1985*), to a
**session** directly; or to neither, a **free album**. Only an album with a session can appear on
the public face; a free album stays in the club app. Widened the same day from "the curated set";
the curation now lives in its **public selection**.
_UI copy_: Album
_Avoid_: gallery (for a single album), folder, collection

**Inbox**:
The **gallery** media items one uploader has not yet placed in an **album** — her workbench for
deleting rejects and sorting the rest. **One per uploader**; those who manage the gallery see and
sort every inbox. Members see nothing in it. An item is in **at most one album**, and in none
exactly while it sits in its uploader's inbox; placing it in an album takes it out. Deleting from
the inbox is final. Uploading straight into an album skips it.
_UI copy_: Eingang
_Avoid_: unsorted, drafts, uploads, staging

**Bin**:
Where gallery items deleted from an **album**, and whole albums, wait **30 days** before they are
gone for good — restorable until then. The **inbox** has no bin: deleting a reject is final.
_UI copy_: Papierkorb
_Avoid_: trash, archive (an archived thing is kept, not on its way out)

**Public selection**:
The hand-picked photos of an **album** — roughly a dozen — that its public face shows once the
album is **published**. Publishing releases the selection, never the whole album; videos are not
in it.
_UI copy_: Auswahl
_Avoid_: public flag, highlights, favourites

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

- **Guest registration & duplicates** — **resolved 2026-09-25 (accounts shaping).**
  Self-registration can create a second person for a human already in the registry. Two rules
  close it, and neither needs the club to hunt for duplicates: when the club records a person
  whose email belongs to a person with no affiliation, it is offered that person to **adopt**
  instead of creating a second; and whatever slips through is closed by her — redeeming an
  invitation to an address that already has an account asks her to sign in with it, and that
  account moves onto the club's person, which absorbs the stray one and everything it holds.

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

- **Who decides a photo is public** — **resolved 2026-10-08 (L7a shaping).** A photo is public
  **only while it is in the public selection of a published album** — there is no public flag on the photo itself. Publishing
  an album is a deliberate act under its own permission, and that act is the **release** (as a board
  seat is what makes a portrait public). There is **no per-person consent** to being photographed:
  the remedy is the takedown contact on the **gallery**, answered by taking the photo out of its
  public selection (or deleting it) — no separate takedown act and no lasting mark. The two senses stay apart as before — if
  per-person consent is ever modelled, it is about *people* and is not a photo flag.

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
