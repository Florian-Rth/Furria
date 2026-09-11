# @furria/screenshot

Headless screenshots of the Club-App so an agent can look at what it built.

```bash
pnpm shot /members                 # four PNGs: phone/desktop × light/dark, after login
pnpm shot /login --no-login        # anonymous route
pnpm shot /members/3 --name person # custom file stem
```

Files land in `web/tools/screenshot/out/<name>-<phone|desktop>-<light|dark>.png` (gitignored).
Open them with the Read tool.

Prerequisites: `pnpm dev:club-app` on port 3001; for routes behind login also Postgres
(`docker compose up -d` in `server/`) and the API (`dotnet run --project src/Furria.Api`).
Login uses the development bootstrap account; override with `SHOT_EMAIL` / `SHOT_PASSWORD`.
The browser is the system Google Chrome (`SHOT_BROWSER_CHANNEL=chrome`); set it to `chromium`
after `pnpm exec playwright install chromium` to use the bundled build instead.
