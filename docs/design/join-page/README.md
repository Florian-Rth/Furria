# Handoff: FURRIA — Mitglied werden (öffentliche Website)

Design direction for the public **Mitglied werden** funnel (`/join`) of the Furrscher Carnevals
Club e.V. ("FURRIA"). This bundle arrived **without a README** — this file was written by the team
while shaping **P6**, so it records both what the mock proposes *and how we ruled on it*.

> **Read `docs/design/README.md` → "READ FIRST" first.** It governs every mock in this repo:
> the design *language* (tokens, Anton/Archivo, radius 14, soft elevation) is binding; layouts,
> flows, features and copy are **inspiration, not spec**, and improving them is actively wanted.

## What the mock contains

`src/fcc-ds-join.jsx` exports `JoinPage({ mode, device, view })`. Open `preview.html` in a browser
(needs internet for CDN React + Google Fonts). Three screens, faked with `useState` because the
prototype has no router:

| `view` | Screen |
|---|---|
| `'index'` | Info page — hero + Findomat, Vorbeikommen, Vereins-Ticket, Weg, Kosten, FAQ, Helfer, Schlussband |
| `'antrag'` | The application form + a live summary panel |
| `'fertig'` | "WILLKOMMEN, LENA." confirmation |

The other `src/` files are the shared brand layer (`fcc-theme.jsx`, `fcc-logos.jsx`) and the
mock-only phone frame (`fcc-shared.jsx` — **do not port**).

## Adopted

- **The page's thesis, and its headline.** *"DU MUSST NICHT TANZEN KÖNNEN."* is the best single line
  in any handoff so far: what keeps people out of a Karnevalsverein is not the Beitrag, it is the
  fear of not fitting in. The whole page is organised around removing that fear, and we keep that.
- **The idea of a matcher** — "wo passe ich hin?" answered without asking for a name or an e-mail.
  Rebuilt from scratch as the [Konfetti-Kompass](../../../plan/website/feature-group-matcher.md);
  see Rejected.
- **A ticket as the page's signature object.** Kept and pushed further (gold, real perforation
  notches, vertical stub, slight tilt) — with entirely rewritten content.
- **The four-step "so wird man Mitglied"** ladder, rewritten.
- **The honest FAQ** ("EHRLICH GESAGT"), which answers the questions people are too polite to ask.
  Roughly half its answers survive; the rest rested on facts that are not true.
- **"Jetzt wird nichts abgebucht"** and the *jetzt fällig: 0 €* summary line — the objection that
  actually stops people, answered in the right place.
- **Deriving nothing from a login.** The mock never confuses joining the club with getting an
  account, which matches the glossary's Mitglied ≠ Account law.

## Rejected, and why

Recorded so the deviations are explained rather than silent (the READ FIRST asks for exactly this).
Full reasoning lives in
[`plan/website/feature-membership-funnel.md`](../../../plan/website/feature-membership-funnel.md)
and [`feature-group-matcher.md`](../../../plan/website/feature-group-matcher.md).

**Wrong about the club:**

- **"ERST VORBEIKOMMEN, DANN ENTSCHEIDEN"** — the mock's entire low-commitment premise. **There are
  no open, drop-in trainings**; nobody can simply turn up. With it go the dated open-training list
  (`Di 04. AUG`), the free-spot counts, *"Anmeldung ist nett, aber nicht nötig"* and *"Turnschuhe
  reichen"*. The zero-commitment step is now the Kompass plus an Anfrage.
- **"Kostüme gestellt oder bezuschusst"** — not (all) true. Removed everywhere.
- **Eight invented Gruppen** (Jugendgarde, Showtanz, Kostüm- & Wagenbau, Technik & Foto …) with
  invented ages, times, venues and free-spot counts. The club has **six**, already shipped on
  `/club`.
- **`Mitgliedschaftsart` = Aktiv / Jugend / Kind.** "Kind" does not exist, and the mock's own
  *"Passiv"* elsewhere is not an Art either — it is a **status**, a membership that pauses for a
  Session. This mock's data triggered a **retraction in `CONTEXT.md`**; the DBML handoff was
  corrected too.
- **Advertising the Club-App** as an included benefit — kept anyway, on the user's explicit
  decision, with a P7 re-check noted. It is unbuilt software.

**Glossary and legal defects:**

- **"Vorstand"** — *"Vorstand nimmt auf"*, *"Der Antrag geht direkt an den Vorstand"*, *"spricht mit
  dem Vorstand"*. There is no Vorstand right in this domain (P4 already fixed this twice). Copy says
  *der Verein* / *wir*.
- **"WILLKOMMEN, LENA."** on the confirmation. She is an applicant, not a Mitglied — the club has not
  decided. New glossary term **Beitrittsantrag**.
- **The consent checkbox defaults to checked** (`ok: true`) — legally invalid — **and bundles photo
  consent** for website, Instagram and Club-App into the same box (Kopplungsverbot), on a topic
  `CONTEXT.md` explicitly flags as unresolved. Ours is unchecked, required, single-purpose, and
  carries **no** photo consent.
- **A manually picked Mitgliedschaftsart** next to a Geburtsdatum field — the form permits "Aktiv"
  with a 2015 birth date. Ours **derives** it and shows it back.
- **A promised SMS confirmation link** for a parent's consent. A whole flow, not built; the guardian
  consents in the form instead (§107 BGB).
- **Three named people with private mobile numbers** (*"Marlies Hoffmann, Präsidentin, 0170 55 44
  21"*). P5 banned inventing plausible real people in an Amt, and publishing private mobiles is a
  spam and DSGVO problem even when they are real. One official channel instead.

**Design:**

- **Hard offset-shadows as the system** (`jHard()`, `12px 12px 0 red`, 2px ink contours, square
  corners) — rejected for the **fifth phase running**. Destillat wins; `shadow.posterOffset` stays
  reserved for hero headlines.
- **`jPanel()`'s hand-rolled inverted dark panel and `jTint()`'s three-way tint** — both hand-roll
  what the theme already gives us; colours must come from the palette so they switch with the scheme.
  Same objection as P5's `gPanel`/`gTint`.
- **The Findomat's mechanics** — a hardcoded if/else over eight invented Gruppen printing one
  winner under the banner "DEIN PLATZ". Fake authority. Replaced by authored per-Gruppe positions
  with Gruppe-owned weights, a normalised score, and a **ranking** the visitor can interrogate.
  The **"-O-Mat" naming is also out on legal exposure**: the Bundeszentrale für politische Bildung
  holds the *Wahl-O-Mat* word mark and has objected to derivative names.
- **The Findomat inside the hero.** `KkHeroSection`'s `Aside` slot lays *behind* the main column at
  `xs` — an interactive card there is unusable on a phone.
- **The ticket's barcode and "MITGLIED NR. 185"** — a fake member number. Ours is a blank dotted
  line, which is honest *and* an invitation.
- **Baked-in chrome** — `JMobBar`, `StatusBar`, `HomeIndicator`, `PhoneFrame`, the mock's own
  masthead and its sticky mobile CTA bar. The real shipped `Masthead`/`SiteFooter` stay untouched,
  as in every prior phase.
- **The Helfer-Liste band** — its target list does not exist (P5's dead-link precedent).
- **The Beitrags-Rechner as an interactive widget** — the fee facts and its reassurance bullets are
  kept as calm, professional information; the steppers are not.
- **"14 Neue 2026/27"** as a hero stat — invented and unverifiable. Three derived stats instead.

## Not in the mock, added by us

- **Filter questions** in the matcher, so an age-impossible match (adult → Kindergarde) is
  structurally impossible rather than merely unlikely.
- **Per-Gruppe recruiting status** (`isRecruiting`), shown honestly in the result: a Gruppe that is
  not searching still ranks where it scored, badged, with *Anfrage trotzdem willkommen*.
- **A derived «warum»** panel per Gruppe — the trust-builder the mock's single verdict cannot offer.
- **A real submission path** — `POST /api/membership-applications` on our own API
  ([ADR-0004](../../adr/0004-website-writes-membership-applications.md)); the mock's buttons only
  call `setState`.
- **Full postal address** on the Antrag; the mock collects city only, which is useless for a
  Verein's records.
- **A human fallback in the form's error state**, so a failed submission never dead-ends.
- **A honeypot** against the bots that will find a public unauthenticated POST.
- **`KkStatRow`** in `@furria/ui` — the mock's third hand-rolled stat row is what surfaced the
  duplication on our side.
