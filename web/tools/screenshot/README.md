# @furria/screenshot

Headless screenshots of the Club-App so an agent can look at what it built, plus the seed that
puts realistic data behind the Start screen.

```bash
pnpm shot /members                 # four PNGs: phone/desktop × light/dark, after login
pnpm shot /login --no-login        # anonymous route
pnpm shot /members/3 --name person # custom file stem
```

Files land in `web/tools/screenshot/out/<name>-<phone|desktop>-<light|dark>.png` (gitignored).
Open them with the Read tool. Console errors, page errors and failed `/api/` calls of every
capture are printed as `! …` lines at the end of the run. A capture that fails, renders nothing
into `#root` or loses requests to a host network change (`net::ERR_NETWORK_CHANGED`, e.g. a
container restarting while the browser runs on the host network) is retried up to five times;
only the attempt that made the file reports its problems.

## Options

| Option | Effect |
|---|---|
| `--name <name>` | File stem; derived from the route otherwise (`/` → `home`) |
| `--out <dir>` | Output folder, relative to `web/tools/screenshot` (default `out`) |
| `--base <url>` | App origin (default `http://localhost:3001`) |
| `--no-login` | Skip the login, for anonymous routes |
| `--viewport phone\|desktop` | Only this viewport; repeat for both (default both) |
| `--scheme light\|dark` | Only this color scheme; repeat for both (default both) |
| `--reduced-motion` | Emulates `prefers-reduced-motion: reduce`, so entrances settle at once |
| `--text-scale <factor>` | Sets the root font size to factor × 100 %, e.g. `2` for 200 % text |
| `--click <selector>` | Clicks the first match before the shot; repeat to click in order |
| `--filmstrip` | Records the arrival instead of a still (see below) |

Every capture runs in a fresh browser context in `de-DE`, `Europe/Berlin` (override with
`SHOT_TIMEZONE`), and forgets the Start screen's on-device memory (`furria.start.*` in
`localStorage`) first, so a quieted item shows again. A page taller than the viewport (e.g. at
`--text-scale 2`) is shot whole: the viewport grows to the content height first, so fixed chrome
such as the navigation sits at the bottom of the image instead of across the middle.

```bash
pnpm shot / --name lena --reduced-motion --viewport phone --scheme light
pnpm shot / --name lena-text200 --text-scale 2 --reduced-motion --viewport phone
pnpm shot '/?sheet=entry-3' --name lena-entry --reduced-motion --viewport phone
pnpm shot / --name lena-ring --click '[data-kk-answer-ring]' --reduced-motion --viewport phone
```

### Filmstrip

`--filmstrip` records the page with the Chrome screencast from navigation on and keeps the frame
on screen at 0, 120, 240, 360, 480, 640, 800, 1000 and 1400 ms after the screen header title
appeared. It writes each frame as `<name>-<viewport>-<scheme>-filmstrip-<offset>ms.png` and one
contact sheet `<name>-<viewport>-<scheme>-filmstrip.png`. It films phone in light unless
`--viewport` / `--scheme` say otherwise, and cannot run with `--reduced-motion`.

## Seeding the Start screen

`src/seed-start.ts` fills a development database through the real API with a small club around
six persona accounts, with every date placed relative to the moment it runs (a training running
right now, a Stellprobe tomorrow, the Sessionseröffnung on the next 11.11., …). It is idempotent:
it finds everything by name, creates only what is missing and moves the calendar entries to the
current moment again, so run it again before shooting on a later day.

```bash
pnpm --filter @furria/screenshot seed:start
```

It needs the API (`:5100`) with its bootstrap admin, and Mailpit (`:8025`, from
`docker compose up -d` in `server/`), because accounts are created by inviting each persona and
redeeming the link from the invitation mail. Every persona's password is `Furria-Persona-1!`:

| Persona | E-mail |
|---|---|
| Lena | `lena.brandt@furria.local` |
| Frank | `frank.weber@furria.local` |
| Sabine | `sabine.roth@furria.local` |
| Kevin | `kevin.maurer@furria.local` |
| Gerd | `gerd.lang@furria.local` |
| Jana | `jana.kuehn@furria.local` |

Some facts have no API edit: an account redeemed weeks ago, a contact change from yesterday,
announcements spread over the last days, start days counted from today, Sabine running the
Kindergarde without being its member, and who has seen which announcement (the API only moves
that forward, and a shot of the Aushänge sheet moves it to the newest). The seed writes them as
one transaction to `out/seed-start.sql`; apply it before shooting:

```bash
docker compose exec -T postgres psql -U furria -d furria < ../web/tools/screenshot/out/seed-start.sql   # in server/
```

or let the seed apply it with `SEED_PSQL='docker compose -f ../../../server/docker-compose.yml exec -T postgres psql -U furria -d furria'`.
The seed prints the persona ids and the calendar entry ids (open one with `/?sheet=entry-<id>`).

| Variable | Default |
|---|---|
| `SEED_API` | `http://localhost:5100` |
| `SEED_MAILPIT` | `http://localhost:8025` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | the development bootstrap admin |
| `SEED_PASSWORD` | `Furria-Persona-1!` |
| `SEED_SQL_OUT` | `out/seed-start.sql` |
| `SEED_PSQL` | unset: write the SQL only |

## Prerequisites

`pnpm dev:club-app` on port 3001; for routes behind login also Postgres
(`docker compose up -d` in `server/`) and the API (`dotnet run --project src/Furria.Api`).
Login uses the development bootstrap account; override with `SHOT_EMAIL` / `SHOT_PASSWORD`
(e.g. a seeded persona).
The browser is the system Google Chrome (`SHOT_BROWSER_CHANNEL=chrome`); set it to `chromium`
after `pnpm exec playwright install chromium` to use the bundled build instead.
