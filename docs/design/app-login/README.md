# Handoff: FURRIA, Club-App Login & Shell (interne Club-App)

Design direction for the entry point of the internal **Club-App** (`app.furria.de`): the login
screen, the splash idea and the authenticated shell around it. This bundle arrived **without a
README**. This file was written by the team while shaping and building **CA-P0**, so it records
both what the mock proposes *and how we ruled on it*.

> **Read `docs/design/README.md` → "READ FIRST" first.** It governs every mock in this repo:
> the design *language* (tokens, Anton/Archivo, radius 14, soft elevation) is binding; layouts,
> flows, features and copy are **inspiration, not spec**, and improving them is actively wanted.

## What the mock contains

`src/fcc-app-login.jsx` is the entry point. Open `preview.html` in a browser (needs internet for
CDN React + Google Fonts). It renders **direction A only**, in four blocks: the splash sequence
(`LoginEntry`, `LoginSplash phase={1|2|3}`), the three mobile states (`LoginStage start="start"`,
`"form"`, `"code"`) and the desktop split screen (`LoginDesk`). Directions B and C exist in the
source but are never rendered.

| File | Content |
|---|---|
| `src/fcc-app-login.jsx` | The three directions plus the splash: `LoginStage`, `LoginCard`, `LoginPoster`, `LoginDesk`, `LoginSplash`, `LoginEntry` |
| `src/fcc-ds-shell.jsx` | Design tokens `T`, icon set `Ic`, shared primitives, `NAVCONFIG` and the `AppShell` (top strip, sidebar, topbar) |
| `src/fcc-theme.jsx` | Shared brand layer: masthead, ticker, confetti, footer |
| `src/fcc-logos.jsx` | Broom mark and wordmark variants |
| `src/fcc-shared.jsx` | Mock-only phone frame: `PhoneFrame`, `StatusBar`, `HomeIndicator`. **Do not port** |

Three directions and their states:

| Direction | Idea | States in the source |
|---|---|---|
| **A** *Bühne* | Dark stage above a light sheet that slides up | `start`, `form`, `code` (mobile); `LoginDesk` (desktop 58/42 split) |
| **B** *Mitgliedsausweis* | The login as a paper membership card, tilted, hard offset shadow | `form`, `code` |
| **C** *Plakat* | Full-red poster with the form printed on it | `form`, `code` |

The splash runs four phases on 120 / 780 / 1700 / 2700 ms timers: letters drop in, confetti
bursts, the motto fades in, a footer line closes it.

`src/fcc-ds-shell.jsx` and `src/fcc-logos.jsx` are byte-identical to the root `docs/design/`
copies. `src/fcc-theme.jsx` is **one line newer** than the root copy (the footer's EVENTS column
was corrected to `Weiberfasching` / `Karten`); do not sync the root file over it.

## Adopted

- **Direction A, the dark stage above a light sheet.** It is the only one of the three that says
  "you are entering the club's back room" without inventing a physical object, and it survives
  the theme's two colour schemes because the stage is scoped dark rather than painted dark.
- **The desktop split, 58 % stage and a fixed form pane.** Kept as ratios in `KkSplitLayout`
  (`flex 1 1 58%` and `flex 0 0 clamp(400px, 34vw, 480px)`), so the form column never stretches
  to an unreadable measure on a wide monitor.
- **The brand lockup on the stage:** Anton `FURRIA` wordmark, short red rule, club name eyebrow.
  This is the website's masthead grammar, and reusing it is what makes the app read as the same
  organisation. Shipped as `KkBrandStage`.
- **The meta row** in the stage's top corners (area, town, session, number). Kept, with real
  values derived at runtime instead of the mock's constants.
- **Two entry points beside the login**, visible rather than hidden. The mock is right that the
  screen's final shape needs them; ours ship **disabled** with `Noch nicht verfügbar.`, because
  neither invitation redemption nor password reset has a backend (B5).
- **The "Kein Zugang?" footer line.** The idea that the screen should explain how one *gets* an
  account is good and rare; the wording changed (see below).
- **Email + password, one submit, nothing else.** The mock's form structure carries over; only
  the first field's label and value were wrong.
- **The shell's shape:** one nav surface (a 256 px sidebar on desktop, a sticky top bar on
  mobile) carrying the brand lockup, the nav list and a user block with an initials avatar, plus
  a page header above the content. Shipped as `KkAppShell` with the fiction stripped out.

## Rejected, and why

Recorded so the deviations are explained rather than silent (the READ FIRST asks for exactly
this). Full reasoning lives in
[`plan/club-app/p0-shell-and-session.md`](../../../plan/club-app/p0-shell-and-session.md) and
[ADR-0006](../../adr/0006-browser-session-storage-and-401-handling.md).

**Wrong about the club:**

- **`HELAU`** (direction B's footer, next to `SEIT 1963`). The Narrenruf is **`Gross - Furria!`**;
  `CONTEXT.md` is explicit that Helau and Alaaf are local heresy. The stage carries the correct
  one as its closing eyebrow.
- **`SEIT 1963`.** The club was founded in **1971**. The founding year is a constant
  (`FOUNDING_YEAR`), never typed into copy.
- **`Nº 128`** (mobile meta row, direction B header, direction C, the desktop strip, the splash
  footer). Sessions are counted from 1971, so 2026/27 is Session **56**, not 128. The number is
  derived from the date by `sessionAt()` together with the session label, so it can never drift
  again. We also spell it `NUMBER <n>`, matching the shipped website's masthead, not `Nº`.
- **The town name, twice over.** The mock says `GROSSBESENSTADT` in the desktop strip and direction
  B's header, and `GROSSFURRA` in direction B's footer. The shipped website says **`GROSSFURRA`**,
  and so does the Club-App.
- **The invented motto `»FURRA HEBT AB«`** and the **`141 TAGE BIS ZUR 1. PRUNKSITZUNG`
  countdown.** No Session motto has been decided and no Prunksitzung date exists in the system;
  both would be a fact the app states without knowing it. The Narrenruf takes the motto's slot.
- **`Termine, Auftritte, Bierliste, Beitrag`** as the sub-line under the heading. It advertises
  four features that do not exist yet. Ours says what is true today:
  `Der Mitgliederbereich des Furrscher Carnevals Club.`
- **`Der Geschäftsführer lädt dich ein`.** Geschäftsführer, Präsident, Präsidentin and Admin
  may all invite; naming one office is wrong. Copy says `Der Verein lädt dich ein`.

**Glossary and legal defects:**

- **`Benutzername oder E-Mail`, prefilled `m.schulz`** (and `Mitglied: m.schulz` in directions B
  and C). There is no username. ADR-0005 dropped `account.username`, B1 ships
  `LoginRequest { Email, Password }` behind an `EmailAddress()` validator, and `CONTEXT.md` bans
  the term. The field is `E-Mail-Adresse`, `type=email`, `autoComplete=username`.
- **The `Angemeldet bleiben` toggle.** Dropped: one storage behaviour means one auth path to
  build, test and reason about, and logout is the explicit exit (ADR-0006). A toggle promising
  more than the 30 day refresh token already gives would also be a lie.
- **`Los geht's`** as the submit label. The button says what it does: `Anmelden`.

**Design:**

- **The splash sequence.** Deferred to the Capacitor shell, where a native splash slot exists and
  a cold start is genuinely slow. In the browser it would be an animation between a member and
  their tool, many times a day. The boot state instead shows the stage, statically, for exactly
  as long as the bootstrap refresh takes.
- **Directions B and C.** Hard offset shadows (`9px 9px 0` ink), a rotated card, square corners,
  a full-red page: the poster idiom was rejected in five prior phases and the design system's
  soft elevation stands.
- **Non-token radii and raw dimensions.** The mock uses 10 / 12 / 26 / 30 / 40 px radii and
  hand-written pixel padding. The system has `radius.base` 14, `radius.chip` 20 and `radius.pill`
  50, and spacing comes from the theme. In the Club-App this is not a convention but a lint
  error ([ADR-0007](../../adr/0007-furria-ui-owns-every-visible-component.md)).
- **Colours with no token:** the sidebar's `#171210`, the radial gold light on the stage, the red
  focus halo `rgba(225,29,42,0.14)` and the broom's `#83531F` wood. READ FIRST forbids new
  colours; the scoped dark scheme supplies the surfaces instead, and MUI's focus styling the ring.
  On that dark stage red resolves to `#FF3B47` and gold to `#FFC42E`, so the mock's light-scheme
  values would have been wrong even if they were tokens.
- **`KKConfetti n={12}` behind the form.** Confetti is strictly rationed and never sits under
  input fields.
- **The `start` state and `Zurück`.** A two-step entry (`SCHÖN, DASS DU DA BIST.` then the form)
  adds a tap to the one screen members use most. The form is on screen immediately.
- **The `EINLADUNG EINLÖSEN` state with its six code boxes.** B5 has not pinned the token
  contract; no form is built against an endpoint that does not exist.
- **Baked-in chrome:** `PhoneFrame`, `StatusBar`, `HomeIndicator`, and the mock's own masthead.
- **The shell's fiction:** the `ANSICHT (DEMO)` role switch, the invented user `Anna Brunner`,
  the `Live-Regie` quick access, the `NAVCONFIG` groups (`Mein Bereich` / `Verein` / `Vorstand`)
  and the topbar's search pill, bell and `+` action. The nav carries exactly one entry,
  `Übersicht`, because exactly one route exists. It grows one entry per phase.

## Not in the mock, added by us

- **A boot state.** The mock's app starts logged in. A real client with a stored refresh token
  must run one refresh before it can render anything, so the stage doubles as a `role="status"`
  boot screen.
- **A boot-failure screen.** When that refresh fails without a 401 (server down, timeout) the
  session is not over: `Die Verbindung zum Server ist fehlgeschlagen. Deine Anmeldung bleibt
  erhalten.` plus `Erneut versuchen`, and the refresh token is kept.
- **A route guard with `returnTo`**, so a deep link survives the detour through the login screen.
- **A session-expired notice** on the login screen after a terminal 401
  (`Deine Sitzung ist abgelaufen. Bitte melde dich neu an.`).
- **Real error states for the form.** The mock has none. Client-side validation messages, one
  deliberately unspecific `E-Mail-Adresse oder Passwort ist falsch.` for every 401 (the server
  equalises unknown e-mail, wrong password, disabled and locked out on purpose), a distinct
  message when the request never reached the server, and a generic fallback.
- **The `Übersicht` page** behind the shell: the `/auth/me` data as three cards (Zugang, Person,
  Mitgliedschaft), with `Keine Mitgliedschaft hinterlegt.` as a first-class case rather than an
  error, because non-member Gruppen people are normal.
- **Logout**, which the mock's user block only draws.
- **The scoped dark stage.** The mock paints hex values; ours sets `data-dark` on the stage
  container so every child resolves its own palette and the light pane beside it is unaffected.
- **A derived session line.** `sessionAt(new Date())` computes number and label, so the screen
  cannot state a wrong session the way the mock does.

## ⚠️ Known invented facts

Everything in this mock that looks like club data is invented and was not carried over:
`SEIT 1963`, `Nº 128`, `HELAU`, `»FURRA HEBT AB«`, `141 TAGE BIS ZUR 1. PRUNKSITZUNG`,
`SESSION 2026 · 11.11.2026`, `GROSSBESENSTADT`, the member `m.schulz`, the user `Anna Brunner`
and the thirteen nav domains in `NAVCONFIG`.
