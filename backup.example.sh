#!/usr/bin/env bash
# Nightly backup of the live system, off-site and encrypted with restic (ADR-0044): the database,
# the media originals (ADR-0023), the WhatsApp bot's session keys (ADR-0042) and the deployment's
# .env and compose file - all from one point. Renditions and upload staging are left out:
# renditions are cache the media worker rebuilds (ADR-0024).
#
# Runs on the host beside docker-compose.yml and .env, as root (it reads the media path and writes
# the staging directory); needs docker, curl and flock. Settings are the BACKUP_* lines of .env
# (.env.example); systemd/furria-backup.timer runs it nightly. Setup and restore:
# docs/ops/PRODUCTION.md, "Backup and restore".
#
# One run:
#   1. a first restic pass over the originals while everything keeps running (uploads the night's
#      new files, kept as the one "pre-pass" snapshot);
#   2. api and waha stop; the database is dumped and the session store copied at rest;
#   3. the "nightly" snapshot is taken of dump + sessions + .env + compose file + originals - only
#      what changed since step 1 is read again - then api and waha start again;
#   4. old snapshots are forgotten and pruned (7 daily, 5 weekly, 12 monthly);
#   5. the target's fill level is read; at 80% or more the run reports a warning.
# The stop lasts seconds to a minute; the website and club app keep serving their pages, WhatsApp
# operations wait in the outbox. BACKUP_PUSH_URL (optional) hears status=up or status=down.

set -Eeuo pipefail

cd "$(dirname "$0")"

restic_image=restic/restic:0.18.1
alpine_image=alpine:3.22
snapshot_host=furria
capacity_warning_percent=80

# A value from the environment, else from .env (docker compose syntax: KEY=value, no expansion).
setting() {
  local name="$1" fallback="${2-}" value
  if [ -n "${!name:-}" ]; then
    printf '%s' "${!name}"
    return
  fi
  value="$(sed -n "s/^${name}=//p" .env 2>/dev/null | tail -n 1)"
  value="${value%$'\r'}"
  case "$value" in
    \"*\") value="${value:1:${#value}-2}" ;;
    \'*\') value="${value:1:${#value}-2}" ;;
  esac
  printf '%s' "${value:-$fallback}"
}

sftp_host="$(setting BACKUP_SFTP_HOST)"
sftp_port="$(setting BACKUP_SFTP_PORT 22)"
sftp_user="$(setting BACKUP_SFTP_USER)"
sftp_path="$(setting BACKUP_SFTP_PATH furria)"
ssh_key="$(setting BACKUP_SSH_KEY /root/.ssh/furria-backup)"
push_url="$(setting BACKUP_PUSH_URL)"
state_dir="$(setting BACKUP_STATE_DIR /var/lib/furria-backup)"
RESTIC_PASSWORD="$(setting BACKUP_RESTIC_PASSWORD)"
export RESTIC_PASSWORD

step="start"

log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }

push() {
  [ -n "$push_url" ] || return 0
  curl -fsS -o /dev/null -m 30 --retry 3 -G \
    --data-urlencode "status=$1" --data-urlencode "msg=$2" "$push_url" ||
    log "Push to BACKUP_PUSH_URL failed"
}

fail() {
  log "Backup failed: $1"
  push down "Backup failed: $1"
  exit 1
}

on_error() { fail "$step (exit $?)"; }
trap on_error ERR

for required in BACKUP_SFTP_HOST BACKUP_SFTP_USER BACKUP_RESTIC_PASSWORD; do
  [ -n "$(setting "$required")" ] || fail "set $required in .env"
done
[ -r "$ssh_key" ] || fail "no SSH key at $ssh_key (BACKUP_SSH_KEY)"

mkdir -p "$state_dir/staging" "$state_dir/cache"
chmod 700 "$state_dir"
staging="$state_dir/staging"
ssh_options="-i /ssh/key -p $sftp_port -o UserKnownHostsFile=/state/known_hosts -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=60 -o ServerAliveCountMax=240"

# restic in its pinned image. The SFTP connection goes through ssh with the mounted key; the host
# key is learnt on the first connection and pinned in the state directory afterwards. /backup holds
# what a snapshot contains, under the same paths every night.
snapshot_mounts=()
restic() {
  docker run --rm -i \
    --hostname "$snapshot_host" \
    -e RESTIC_PASSWORD \
    -e RESTIC_REPOSITORY="sftp:$sftp_user@$sftp_host:$sftp_path" \
    -e RESTIC_CACHE_DIR=/state/cache \
    -v "$ssh_key:/ssh/key:ro" \
    -v "$state_dir:/state" \
    "${snapshot_mounts[@]}" \
    "$restic_image" \
    -o sftp.command="ssh $ssh_options $sftp_user@$sftp_host -s sftp" \
    "$@"
}

# The target's used and total space in KiB, as sftp's df reports it (statvfs).
target_usage() {
  printf 'df\n' | docker run --rm -i \
    -v "$ssh_key:/ssh/key:ro" \
    -v "$state_dir:/state" \
    --entrypoint sftp \
    "$restic_image" \
    -q -b - -o IdentityFile=/ssh/key -P "$sftp_port" -o UserKnownHostsFile=/state/known_hosts \
    -o StrictHostKeyChecking=accept-new "$sftp_user@$sftp_host" |
    awk '$1 ~ /^[0-9]+$/ && $2 ~ /^[0-9]+$/ { size = $1; used = $2 } END { if (size) print used, size }'
}

# `./backup.sh restic <command>` runs restic against the repository with these settings - for
# init, snapshots and restore (docs/ops/PRODUCTION.md). /state is the state directory.
if [ "${1-}" = restic ]; then
  shift
  trap - ERR
  restic "$@"
  exit
fi

exec 9>"$state_dir/backup.lock"
flock -n 9 || fail "another backup or check is running"

step="finding the media path"
# Wherever the api mounts /media - the named volume or MEDIA_PATH.
api_container="$(docker compose ps -aq api)"
[ -n "$api_container" ] || fail "no api container in this compose project"
media_root="$(docker inspect -f '{{ range .Mounts }}{{ if eq .Destination "/media" }}{{ .Source }}{{ end }}{{ end }}' "$api_container")"
[ -d "$media_root/originals" ] || fail "no originals under $media_root"
snapshot_mounts=(-v "$staging:/backup/staged:ro" -v "$media_root/originals:/backup/originals:ro")

step="removing stale locks"
restic unlock --quiet

step="first pass over the originals"
log "First pass over the originals"
pre_pass="$(restic backup --quiet --json --host "$snapshot_host" --tag pre-pass /backup/originals |
  sed -n 's/.*"message_type":"summary".*"snapshot_id":"\([0-9a-f]*\)".*/\1/p')"
[ -n "$pre_pass" ] || fail "first pass left no snapshot"

step="stopping api and waha"
find "$staging" -mindepth 1 -delete
restart_services() { docker compose start waha api >/dev/null; }
trap 'restart_services' EXIT
log "Stopping api and waha"
docker compose stop api waha

step="dumping the database"
# Uncompressed custom format: restic compresses, and an uncompressed dump deduplicates.
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -Z 0' > "$staging/database.dump"

step="copying the WhatsApp sessions"
docker run --rm --volumes-from "$(docker compose ps -aq waha)" "$alpine_image" tar -cf - -C /app/.sessions . > "$staging/waha-sessions.tar"

step="copying .env and the compose file"
cp .env docker-compose.yml "$staging/"

step="taking the snapshot"
log "Taking the snapshot"
# Its parent is the first pass: originals unchanged since then are not read again.
restic backup --quiet --host "$snapshot_host" --tag nightly --parent "$pre_pass" /backup

step="starting api and waha"
restart_services
trap - EXIT
log "api and waha started again"
find "$staging" -mindepth 1 -delete

step="forgetting old snapshots"
restic forget --quiet --host "$snapshot_host" --tag pre-pass --keep-last 1
restic forget --quiet --host "$snapshot_host" --tag nightly --keep-daily 7 --keep-weekly 5 --keep-monthly 12 --prune

step="reading the target's capacity"
read -r used_kib size_kib < <(target_usage) || true
if [ -n "${size_kib:-}" ]; then
  used_percent=$((used_kib * 100 / size_kib))
  capacity="target ${used_percent}% full ($((used_kib / 1048576)) of $((size_kib / 1048576)) GiB)"
else
  used_percent=100
  capacity="target capacity unknown (sftp df failed)"
fi

step="summing up"
summary="$(restic snapshots --host "$snapshot_host" --tag nightly --latest 1 --compact | sed -n 3p | awk '{ print $1, $2, $3 }')"
if [ "$used_percent" -ge "$capacity_warning_percent" ]; then
  log "Backup done ($summary), WARNING: $capacity"
  push down "Backup done, WARNING: $capacity"
else
  log "Backup done ($summary), $capacity"
  push up "Backup done, $capacity"
fi
