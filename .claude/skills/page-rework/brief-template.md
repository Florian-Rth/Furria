# <Area> — three variants (common brief)

Worktree: <absolute worktree path>. Owner: Florian. He compares the variants on his phone (club app dev
server http://<host-ip>:3011/lab) and desktop, and picks one.

## Owner's wish (binding, his words)
> <quote>
Surface: <pro hub | member surface>.

## Design rules (binding — copied from the page-rework skill)
<paste rules 1–8 from .claude/skills/page-rework/SKILL.md "Florian's design rules", trimmed to the surface:
for a pro hub keep 2 and drop the showpiece half of 3; for a member surface keep 3>.

## Read first (mandatory)
CLAUDE.md · .claude/skills/frontend-work/SKILL.md · docs/design/README.md (READ FIRST) · docs/web/TESTING.md ·
<plan file> · CONTEXT.md entries <terms> · <ADRs>.

## Data and actions that exist (use ONLY these)
<from the Phase 1 audit: fields per entity, hooks, mutations, permissions, existing screens to link to>.
Planned features that don't exist yet: <list> — give them an obvious place, show at most one quiet
"kommt noch" mention, no fake data.

## Constraints
- Club-app visuals only via @furria/ui (ADR-0007). Prefer existing primitives; new ones in
  web/packages/ui/src/Kk<Prefix>*/, exported from index.ts by Edit-insert only (others edit it concurrently).
- Your code only in web/apps/club-app/src/features/lab-<slug>/ and routes/_app/lab_.<slug>….tsx (check flat-route
  naming against existing files). Lab hub entries are done by the lead.
- Don't touch server/, the production feature folder, or other variants' folders.
- Pure decision logic → pure functions + co-located tests (decisions, not text).
- Validation (never docker without --user):
  W=<worktree>; docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 -v $W:$W -w $W/web node:24.21-alpine sh -c "corepack pnpm exec biome check apps/club-app/src/features/lab-<slug> apps/club-app/src/routes packages/ui/src && corepack pnpm --filter @furria/club-app typecheck && corepack pnpm --filter @furria/ui typecheck && corepack pnpm --filter @furria/club-app test <tests>"
  Another agent's files may fail a check — re-run before blaming yourself; fix only your files.
- Browser check: dev stack runs (scripts/dev.sh). Shoot every route phone + desktop, light + dark with
  web/tools/screenshot (Playwright image mcr.microsoft.com/playwright:v1.63.0-noble, --network host, --user,
  SHOT_BROWSER_CHANNEL=chromium; playwright node_modules in the main checkout if missing). Prefix shot names.
  Look at every shot as a demanding senior product designer and iterate.
- Dev data is shared and partly the owner's — don't change or delete it. <seeded records, if any>.
- Do not commit.

## Final report (≤ 400 words)
Page system (pages, sub hubs, routes), the first 3 seconds, the core interaction loop, files, checks, shot
paths, honest weaknesses.
