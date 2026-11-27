# Backups go off-site, encrypted, from one point

The live system runs on one host with one disk, so a backup on that host dies with it. Every night
the database, the media originals, the WhatsApp bot's session keys and the deployment's `.env` and
compose file are captured from **one point** (ADR-0023: the API stops for the dump and the last
pass over the originals) and stored with **restic** in an encrypted, deduplicated repository on an
**off-site SFTP target**. There is no local copy. Decided with Florian on 2026-11-26.

## Considered options

- **Local snapshots with hard links** (the former `backup.example.sh`) plus an operator's copy off
  the host — rejected: the off-host copy was never made, and the local copy only guards against
  mistakes, not against losing the host.
- **Continuous archiving for point-in-time restore** (WAL shipping) — rejected: a day of loss is
  acceptable for the club, and the moving parts are not.

## Consequences

- **The `.env` is backed up**, encrypted: without its signing, push and passkey keys a restored
  system breaks every signed media link and push subscription.
- **The restic password and the target's credentials must exist off the host** (on paper as well):
  without them the repository is unreadable, by anyone.
- **Retention is 7 daily, 5 weekly, 12 monthly snapshots, then gone.** Deleted media and erased
  persons (ADR-0021) leave the backups after 12 months at the latest; no yearly archive is kept.
- **A restore brings back persons erased after the snapshot**, and nothing re-erases them: by
  ADR-0021 the app keeps no list of whom it erased. Accepted, as restores are rare and close to the
  snapshot.
- **The target's capacity is watched**, not sized up front: media grows 0.2–0.3 TB per season, so
  each run reports how full the target is and warns at 80%.
- **A weekly check proves the backup restorable**: the repository's integrity, the latest dump
  restored into a throwaway database, a random sample of originals compared byte for byte, and the
  `.env` present. There is no manual restore drill.
- **Alerting is a push URL** (an Uptime Kuma push monitor or similar), optional until a monitor
  exists; it catches a run that fails as well as one that never starts.
