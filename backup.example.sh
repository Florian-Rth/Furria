#!/usr/bin/env bash
# Backs up the database and the media originals from the same point (ADR-0023), together with the
# WhatsApp bot's session keys (ADR-0042). Renditions and upload staging are left out: renditions
# are cache the media worker rebuilds (ADR-0024).
#
# Usage on the host, next to docker-compose.yml (as root - it reads the media volume; needs rsync):
#   cp backup.example.sh backup.sh && chmod +x backup.sh
#   BACKUP_DIR=/mnt/backup/furria ./backup.sh
#   # nightly: 30 3 * * * cd ~/furria && BACKUP_DIR=/mnt/backup/furria ./backup.sh >> backup.log 2>&1
#
# Every run is one snapshot under $BACKUP_DIR/<UTC time>/: database.dump (pg_dump custom format),
# originals/ and waha-sessions.tar.gz. Originals never change once written, so unchanged files are
# hard links into the previous snapshot and cost no space. The API and the bot are stopped only for
# the dump, the final media pass and the session copy (seconds to minutes); the website and club
# app keep serving their pages meanwhile - WhatsApp operations wait in the outbox.
# Restore: docs/ops/PRODUCTION.md, "Backup and restore".

set -euo pipefail

: "${BACKUP_DIR:?set BACKUP_DIR (ideally another disk than the media path)}"
BACKUP_KEEP="${BACKUP_KEEP:-14}"

cd "$(dirname "$0")"

# Wherever the api mounts /media - the named volume or MEDIA_PATH.
media_root="$(docker inspect -f '{{ range .Mounts }}{{ if eq .Destination "/media" }}{{ .Source }}{{ end }}{{ end }}' "$(docker compose ps -aq api)")"
[ -d "$media_root/originals" ] || { echo "No originals under $media_root" >&2; exit 1; }

mkdir -p "$BACKUP_DIR"
snapshot="$BACKUP_DIR/$(date -u +%Y-%m-%dT%H%M%SZ)"
partial="$snapshot.partial"
previous="$(find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*Z' | sort | tail -n 1)"
link_dest=()
[ -n "$previous" ] && link_dest=(--link-dest="$previous/originals")

copy_originals() {
  rsync -a --delete "${link_dest[@]}" "$media_root/originals/" "$partial/originals/"
}

mkdir -p "$partial"

# The bulk of the copy runs while everything keeps running.
copy_originals

# Then the API stops, so no original is added or deleted between the dump and the last pass, and
# the bot stops, so its session store is copied at rest and matches the post records in the dump.
trap 'docker compose start waha api >/dev/null' EXIT
docker compose stop api waha
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$partial/database.dump"
copy_originals
docker run --rm --volumes-from "$(docker compose ps -aq waha)" alpine:3.22 tar -czf - -C /app/.sessions . > "$partial/waha-sessions.tar.gz"
docker compose start waha api
trap - EXIT

mv "$partial" "$snapshot"
echo "Backup $snapshot: database $(du -h "$snapshot/database.dump" | cut -f1), originals $(du -sh "$snapshot/originals" | cut -f1) (shared with earlier snapshots)"

find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*Z' | sort | head -n "-$BACKUP_KEEP" | xargs -r rm -rf
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '*.partial' ! -path "$partial" -exec rm -rf {} +
