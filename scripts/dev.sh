#!/usr/bin/env bash
# Start/stop the local dev stack, reachable from other devices (vite --host).
#
#   scripts/dev.sh up       # postgres + mailpit + API + website + club-app
#   scripts/dev.sh down     # stop API + vite servers (postgres/mailpit keep running)
#   scripts/dev.sh down-all # also stop postgres + mailpit
#   scripts/dev.sh status
#   scripts/dev.sh logs [api|website|club-app]
#
# Env overrides: WEBSITE_PORT (3010), CLUB_APP_PORT (3011).
# The vite proxies target the API on :5100, so the API port is fixed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE="$ROOT/.dev"
NODE_IMAGE="node:24.21-alpine"
SLUG="$(basename "$ROOT" | tr -c 'a-zA-Z0-9\n' '-')"
WEBSITE_PORT="${WEBSITE_PORT:-3010}"
CLUB_APP_PORT="${CLUB_APP_PORT:-3011}"
API_PORT=5100

mkdir -p "$STATE"

port_busy() { ss -ltn "sport = :$1" | grep -q LISTEN; }
container_running() { [ "$(docker inspect -f '{{.State.Running}}' "$1" 2>/dev/null)" = "true" ]; }

ensure_container() { # name, port, docker run args...
  local name=$1 port=$2
  shift 2
  if container_running "$name"; then
    echo "✓ $name running"
  elif docker inspect "$name" >/dev/null 2>&1; then
    docker start "$name" >/dev/null && echo "▶ $name started"
  elif port_busy "$port"; then
    echo "✓ :$port already in use — assuming $name is provided elsewhere"
  else
    docker run -d --name "$name" "$@" >/dev/null && echo "▶ $name created"
  fi
}

node_run() { # extra docker args..., -- , command
  docker run --user "$(id -u):$(id -g)" -e HOME=/tmp -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    -v "$ROOT:$ROOT" -w "$ROOT/web" "$@"
}

start_vite() { # app, port
  local app=$1 port=$2 name="furria-dev-$1-$SLUG"
  if container_running "$name"; then echo "✓ $app running"; return; fi
  if port_busy "$port"; then echo "✗ :$port busy — set ${app^^}_PORT"; return 1; fi
  docker rm -f "$name" >/dev/null 2>&1 || true
  node_run -d --name "$name" --network host "$NODE_IMAGE" \
    sh -c "corepack pnpm --filter @furria/$app dev --host --port $port --strictPort" >/dev/null
  echo "▶ $app on :$port"
}

start_api() {
  if [ -f "$STATE/api.pid" ] && kill -0 "$(cat "$STATE/api.pid")" 2>/dev/null; then
    echo "✓ api running"; return
  fi
  if port_busy "$API_PORT"; then echo "✓ :$API_PORT already in use — assuming API runs elsewhere"; return; fi
  # exec: $! is the session leader, so `down` can kill dotnet run + the API as one group
  (cd "$ROOT/server" && exec setsid dotnet run --project src/Furria.Api >"$STATE/api.log" 2>&1 </dev/null) &
  echo $! >"$STATE/api.pid"
  echo "▶ api on :$API_PORT (log: .dev/api.log)"
}

stop_api() {
  [ -f "$STATE/api.pid" ] || return 0
  local pid
  pid="$(cat "$STATE/api.pid")"
  kill -- "-$pid" 2>/dev/null && echo "■ api stopped" || true
  rm -f "$STATE/api.pid"
}

up() {
  ensure_container furria-dev-postgres 5432 -p 127.0.0.1:5432:5432 \
    -e POSTGRES_USER=furria -e POSTGRES_PASSWORD=furria -e POSTGRES_DB=furria \
    -v furria-dev-postgres:/var/lib/postgresql postgres:18.6-alpine
  ensure_container furria-dev-mailpit 8025 -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 axllent/mailpit:v1.27

  if [ ! -d "$ROOT/web/node_modules" ]; then
    echo "… pnpm install"
    node_run --rm "$NODE_IMAGE" sh -c "corepack pnpm config set store-dir /tmp/store && corepack pnpm install --frozen-lockfile"
  fi

  start_api
  start_vite website "$WEBSITE_PORT"
  start_vite club-app "$CLUB_APP_PORT"

  local ip
  ip="$(hostname -I | awk '{print $1}')"
  echo
  echo "Website:  http://$ip:$WEBSITE_PORT"
  echo "Club app: http://$ip:$CLUB_APP_PORT"
  echo "Mailpit:  http://127.0.0.1:8025"
}

down() {
  stop_api
  for app in website club-app; do
    docker rm -f "furria-dev-$app-$SLUG" >/dev/null 2>&1 && echo "■ $app stopped" || true
  done
}

down_all() {
  down
  docker stop furria-dev-postgres furria-dev-mailpit >/dev/null 2>&1 && echo "■ postgres + mailpit stopped" || true
}

status() {
  for c in furria-dev-postgres furria-dev-mailpit "furria-dev-website-$SLUG" "furria-dev-club-app-$SLUG"; do
    container_running "$c" && echo "● $c" || echo "○ $c"
  done
  if [ -f "$STATE/api.pid" ] && kill -0 "$(cat "$STATE/api.pid")" 2>/dev/null; then
    echo "● api (pid $(cat "$STATE/api.pid"))"
  else
    echo "○ api"
  fi
}

logs() {
  case "${1:-api}" in
    api) tail -f "$STATE/api.log" ;;
    website | club-app) docker logs -f "furria-dev-$1-$SLUG" ;;
    *) echo "unknown: $1" >&2; exit 1 ;;
  esac
}

case "${1:-}" in
  up) up ;;
  down) down ;;
  down-all) down_all ;;
  restart) down; up ;;
  status) status ;;
  logs) logs "${2:-}" ;;
  *) sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
