# Error paths — audit + fix row (2026-10-14)

Trigger: gallery hub showed grey/broken tiles + 404 console spam. Root cause of the 404s was the dev
env (a stale media worker of a deleted worktree claimed this worktree's jobs; originals lost) —
fixed in `scripts/dev.sh` (one shared dev media root + worker). The UI then exposed how poorly
broken/failed media and many other error paths are handled. Four read-only audits found ~90 paths.

## Cross-cutting decisions

- **Offline fails fast.** Club-app and website QueryClients use `networkMode: 'always'` for queries
  and mutations; `useApiMutation` defaults to `offline: 'fail'`. A cold load offline becomes an
  `unreachable` error with retry (existing error states), a write fails with the unreachable message
  instead of spinning and firing later. No per-screen `isPaused` UI.
- **A broken image never removes the action.** `KkFrame` stays interactive when its image faults;
  it shows the broken placeholder inside the button.
- **Media state is shown, never guessed.** Every thumb uses `shownSourceOf` (no URL for
  failed/processing); failed → cross mark, processing → breathe, in strips, loupe, bin, pickers.
- **Every error state offers a way out** (retry, back, re-login); retry buttons show busy while
  refetching; silent "empty" fallbacks on error are replaced by error rows.
- **Navigation after a write that removes the edited entity** happens in the mutation promise
  (`mutateAsync().then`) — per-call `onSuccess` is dropped once the cache refetch unmounts the owner.

## Ownership (builders, disjoint files)

| Builder | Scope |
|---|---|
| A media | `packages/ui` frame/strip/viewer/slot-row, `features/gallery`, `lib/media` |
| B pickers | `features/{gallery-pick,news,website-pictures}` |
| C platform | query clients, `lib/api`, `lib/query*`, `features/{session,login,password-reset,request-access,redeem,start,system,write}`, `lib/passkey`, routes root, `packages/ui` error-state primitives, whole `apps/website` |
| D calendar | `features/{calendar,club,events,members,attendance,announcements,to-dos,entry-sheet}` + server calendar entry by id |
| E manage | `features/{groups,group-*,manage-*}` |

Findings per builder are in the builder prompts (session 2026-10-14); status tracked below.

## Status

- [x] A · [x] B · [x] C · [x] D · [x] E · [x] F follow-ups · [x] consolidation (`KkRetryAlert`)
- [x] lint + typecheck clean, all web tests (2914) green, server build 0 warnings, calendar tests green
- [ ] browser check of /gallery (dev stack was down) · [ ] commit + PR
- Kept on purpose: person erasure stays raw `useMutation` (refetch would 404 the screen before landing).
