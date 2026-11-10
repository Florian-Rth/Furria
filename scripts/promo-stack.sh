#!/usr/bin/env bash
# Start/stop the isolated promo stack: the demo club behind the projector reel's screenshots.
#
#   scripts/promo-stack.sh up       # database furria_promo + media worker + API :5140 + website :3040 + club app :3041
#   scripts/promo-stack.sh seed     # seed-start + seed-promo against it (idempotent, run before every shoot)
#   scripts/promo-stack.sh down     # stop API, vite servers and the promo media worker (data stays)
#   scripts/promo-stack.sh worker-build  # rebuild the promo media worker image from this worktree
#   scripts/promo-stack.sh status
#   scripts/promo-stack.sh logs [api|website|club-app|worker]
#   scripts/promo-stack.sh reset    # down + drop furria_promo and its media (asks first)
#
# Shares the dev postgres (furria-dev-postgres) and Mailpit (furria-dev-mailpit) of scripts/dev.sh,
# never their database: everything lives in furria_promo and ~/furria-promo-media.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE="$ROOT/server/.dev"
NODE_IMAGE="node:24.21-alpine"
API_PORT=5140
WEBSITE_PORT=3040
CLUB_APP_PORT=3041
DATABASE=furria_promo
PROMO_MEDIA="$HOME/furria-promo-media"
WORKER_IMAGE=furria-promo-media-worker:latest
WORKER=furria-promo-media-worker
POSTGRES=furria-dev-postgres
DB_CONNECTION="Host=localhost;Port=5432;Database=$DATABASE;Username=furria;Password=furria"
PSQL="docker exec -i $POSTGRES psql -U furria -d $DATABASE"

mkdir -p "$STATE" "$PROMO_MEDIA"

port_pid() { ss -ltnpH "sport = :$1" | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2; }
container_running() { [ "$(docker inspect --type container -f '{{.State.Running}}' "$1" 2>/dev/null)" = "true" ]; }

node_run() {
  docker run --user "$(id -u):$(id -g)" -e HOME=/tmp -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    -v "$ROOT:$ROOT" -w "$ROOT/web" "$@"
}

ensure_database() {
  container_running "$POSTGRES" || { echo "✗ $POSTGRES is not running — scripts/dev.sh up starts it"; exit 1; }
  if [ -z "$(docker exec "$POSTGRES" psql -U furria -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE'")" ]; then
    docker exec "$POSTGRES" createdb -U furria "$DATABASE" && echo "▶ database $DATABASE created"
  else
    echo "✓ database $DATABASE"
  fi
}

build_worker() { # snap docker cannot read ~/.herdr, so the build context is piped as a tar
  echo "… building $WORKER_IMAGE from this worktree"
  (cd "$ROOT/server" && tar -c --exclude=bin --exclude=obj --exclude=.media --exclude=.dev --exclude=tests . |
    docker build -q -f src/Furria.MediaWorker/Dockerfile -t "$WORKER_IMAGE" - >/dev/null)
}

start_worker() {
  docker image inspect "$WORKER_IMAGE" >/dev/null 2>&1 || build_worker
  if container_running "$WORKER"; then echo "✓ $WORKER running"; return; fi
  docker rm -f "$WORKER" >/dev/null 2>&1 || true
  docker run -d --name "$WORKER" --restart unless-stopped --network host --user "$(id -u):$(id -g)" \
    -e Media__RootPath=/media -e "ConnectionStrings__AppDb=$DB_CONNECTION" \
    -v "$PROMO_MEDIA:/media" "$WORKER_IMAGE" >/dev/null
  echo "▶ $WORKER"
}

wait_for_api() {
  for _ in $(seq 1 90); do
    curl -sf "http://127.0.0.1:$API_PORT/api/health" >/dev/null && { echo "✓ api answers on :$API_PORT"; return; }
    sleep 2
  done
  echo "✗ api did not come up — see server/.dev/promo-api.log"; exit 1
}

start_api() {
  if [ -n "$(port_pid "$API_PORT")" ]; then echo "✓ api on :$API_PORT"; return; fi
  # migrations run on startup (DatabaseMigrator); Development brings the bootstrap admin;
  # the club app must be localhost: the passkey relying party is localhost in Development;
  # the seed redeems ~50 invitations from one address, above the signed-out limit of 30
  (cd "$ROOT/server" &&
    ASPNETCORE_ENVIRONMENT=Development \
    ASPNETCORE_URLS="http://127.0.0.1:$API_PORT" \
    ConnectionStrings__AppDb="$DB_CONNECTION" \
    Media__RootPath="$PROMO_MEDIA" \
    Website__BaseUrl="http://127.0.0.1:$WEBSITE_PORT" \
    ClubApp__BaseUrl="http://localhost:$CLUB_APP_PORT" \
    RateLimits__SignedOut__PermitsPerIp=1000 \
    exec setsid dotnet run --no-launch-profile --project src/Furria.Api >"$STATE/promo-api.log" 2>&1 </dev/null) &
  echo $! >"$STATE/promo-api.pid"
  echo "▶ api on :$API_PORT (log: server/.dev/promo-api.log)"
  wait_for_api
}

stop_api() {
  local pid
  pid="$(port_pid "$API_PORT")"
  [ -n "$pid" ] && kill "$pid" && echo "■ api stopped"
  if [ -f "$STATE/promo-api.pid" ]; then
    kill -- "-$(cat "$STATE/promo-api.pid")" 2>/dev/null || true
    rm -f "$STATE/promo-api.pid"
  fi
}

start_vite() { # app, port
  local app=$1 port=$2 name="furria-promo-$1"
  if container_running "$name"; then echo "✓ $name running"; return; fi
  docker rm -f "$name" >/dev/null 2>&1 || true
  node_run -d --name "$name" --network host -e FURRIA_API_PROXY="http://127.0.0.1:$API_PORT" "$NODE_IMAGE" \
    sh -c "corepack pnpm --filter @furria/$app dev --host --port $port --strictPort" >/dev/null
  echo "▶ $app on :$port"
}

up() {
  ensure_database
  start_worker
  start_api
  start_vite website "$WEBSITE_PORT"
  start_vite club-app "$CLUB_APP_PORT"
  echo
  echo "Website:  http://127.0.0.1:$WEBSITE_PORT"
  echo "Club app: http://localhost:$CLUB_APP_PORT"
  echo "API:      http://127.0.0.1:$API_PORT"
}

seed_step() { # seed name; the node image has no psql, so its SQL is applied from here
  local out="$ROOT/web/tools/screenshot/out/promo-$1.sql"
  rm -f "$out"
  node_run --rm --network host -e SEED_API="http://127.0.0.1:$API_PORT" -e SEED_SQL_OUT="out/promo-$1.sql" \
    "$NODE_IMAGE" sh -c "corepack pnpm --filter @furria/screenshot seed:$1"
  $PSQL -q <"$out"
}

seed() {
  seed_step start
  seed_step promo
}

down() {
  stop_api
  for name in furria-promo-website furria-promo-club-app "$WORKER"; do
    docker rm -f "$name" >/dev/null 2>&1 && echo "■ $name stopped" || true
  done
}

reset() {
  read -r -p "Drop $DATABASE and $PROMO_MEDIA? [y/N] " answer
  [ "$answer" = "y" ] || exit 1
  down
  docker exec "$POSTGRES" dropdb -U furria --if-exists "$DATABASE"
  rm -rf "$PROMO_MEDIA"
  echo "■ $DATABASE dropped"
}

status() {
  for name in "$WORKER" furria-promo-website furria-promo-club-app; do
    container_running "$name" && echo "● $name" || echo "○ $name"
  done
  local pid
  pid="$(port_pid "$API_PORT")"
  [ -n "$pid" ] && echo "● api :$API_PORT (pid $pid)" || echo "○ api"
}

logs() {
  case "${1:-api}" in
    api) tail -f "$STATE/promo-api.log" ;;
    website | club-app) docker logs -f "furria-promo-$1" ;;
    worker) docker logs -f "$WORKER" ;;
    *) echo "unknown: $1" >&2; exit 1 ;;
  esac
}

case "${1:-}" in
  up) up ;;
  worker-build) build_worker; docker rm -f "$WORKER" >/dev/null 2>&1 || true; start_worker ;;
  seed) seed ;;
  down) down ;;
  reset) reset ;;
  status) status ;;
  logs) logs "${2:-}" ;;
  *) sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
