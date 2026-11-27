---
rfc: 0012
title: Production backups off-site with restic
status: in-progress
github_issue: 107
branch: feat/rfc-107-production-backups
created: 2026-11-26
---

# RFC 0012: Production backups off-site with restic

## Summary
The live system has no running backup: `backup.example.sh` exists but was never installed, and it
would only write to the same disk. This RFC turns it into a nightly, encrypted, deduplicated
**restic** backup to an off-site SFTP target (a storage box), taken from one point, with fixed
retention, a capacity warning, an optional alert push and a weekly automatic restore check.
Grilled 2026-11-26; decision:
[ADR-0044](../adr/0044-backups-go-off-site-encrypted-from-one-point.md).

## Motivation
Losing the host today loses every member record, every photo and video, the WhatsApp bot's pairing
and the deployment's secrets — the last of which also breaks every signed media link and push
subscription on a rebuilt system. A backup on the host itself does not help against that, and an
untested or silently stopped backup is not a backup.

## Proposal

### What a snapshot holds
| Item | How |
|---|---|
| Database | `pg_dump -Fc`, with `api` and `waha` stopped |
| Media originals | the `originals/` directory under the media path (renditions and staging are rebuilt / transient) |
| WhatsApp sessions | tar of the `waha` session volume, copied at rest |
| Deployment config | `.env` and the compose file beside the script |

Consistency stays as today (ADR-0023): a first restic pass over the originals runs while
everything is up; then `api` and `waha` stop, the dump is taken, the sessions are copied, and the
snapshot is made from the staged dump + sessions + config + originals; then both start again. The
stop lasts seconds to a minute; the website and club app keep serving pages.

### Tooling
- **restic as a pinned Docker image** (no host package), run by the script with the media path,
  a staging directory and an SSH key mounted.
- **Target**: an SFTP repository; host, user, path, key file and password come from the
  deployment's `.env` — nothing about the target lives in the repo.
- **Schedule**: systemd timers (examples in `systemd/`) (`Persistent=true`, so a missed run catches up after boot) —
  nightly backup at 03:30 Europe/Berlin, weekly check (`backup.sh check`) Sunday 05:00, waiting for a backup still running. Unit files ship as
  examples beside the script.
- **Retention**: `forget --prune` with 7 daily, 5 weekly, 12 monthly.
- **Capacity**: after each run the script reads the target's used/total space and reports a
  warning at ≥ 80%.
- **Alert push**: optional `BACKUP_PUSH_URL` (Uptime Kuma push format: `?status=up|down&msg=…`);
  called on success and on failure of both the backup and the check. Empty = log only.

### Weekly check
1. `restic check --read-data-subset=5%` — repository integrity plus a rotating sample of the data.
2. Restore the latest `database.dump` into a throwaway Postgres container (same image as the live
   one), `pg_restore --exit-on-error`, assert that core tables hold rows; remove the container.
3. Restore a random sample of originals from the latest snapshot and compare them byte for byte
   with the live files (skipping ones deleted since).
4. Assert the snapshot holds `.env`, the compose file and the session archive.

### Restore
`docs/ops/PRODUCTION.md` → "Backup and restore" is rewritten: list snapshots, restore one into a
directory, then the existing steps (sessions, database, originals, regenerate renditions). Persons
erased after the snapshot come back and are not re-erased (ADR-0044).

## Phases

### Phase 1 — Nightly backup
Goal: the repo ships a working restic backup script, its timer units and docs; nothing on the host
changes yet.
- [x] Rewrite `backup.example.sh` as the restic backup (staged dump + sessions + config + originals from one point)
- [x] Retention (`forget --prune` 7/5/12), capacity report with 80% warning, optional push URL on success/failure
- [x] systemd service + timer examples for the nightly run (03:30 Europe/Berlin, `Persistent=true`)
- [x] Backup settings in `.env.example` (target, password, key file, push URL) with generic placeholders
- [x] Rewrite "Backup and restore" in `docs/ops/PRODUCTION.md` (setup, what's in a snapshot, restore from restic)
- [x] Try the script end to end against a local scratch SFTP target and a scratch compose project

### Phase 2 — Weekly restore check
Goal: the repo ships the weekly check and its timer; a broken backup is noticed within a week.
- [x] Check script: `restic check --read-data-subset=5%`
- [x] Restore the latest dump into a throwaway Postgres and assert core tables hold rows
- [x] Restore a random sample of originals and compare byte for byte with the live files
- [x] Assert `.env`, compose file and session archive are in the snapshot; push URL on success/failure
- [x] systemd service + timer examples (Sunday, after the backup)
- [x] Document the check in `docs/ops/PRODUCTION.md`; try it against the scratch target

### Phase 3 — Live installation
Goal: the live host backs up nightly and checks weekly. Run by Florian (root, approval needed).
- [x] Host setup script (outside the repo): SSH key for the target, settings in the live `.env`, `restic init`
- [x] Install and enable both timers; first backup run by hand
- [ ] First check run by hand; restic password and target credentials stored off the host (incl. paper)

## Risks & alternatives
- **Target fills up** as media grows (0.2–0.3 TB per season) — the 80% warning
  gives time to upgrade the target in place.
- **Lost password** makes every snapshot unreadable — hence the off-host and paper copy.
- **No alerting until a monitor exists** — a failing backup is only in the log until
  `BACKUP_PUSH_URL` is set.
- Rejected: local hard-link snapshots, continuous WAL archiving, a manual restore drill (ADR-0044).

## Out of scope
- Backups of anything on the host besides this deployment.
- Setting up the monitor behind `BACKUP_PUSH_URL`.
- Re-erasing persons after a restore.
