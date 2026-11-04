#!/bin/bash
# Stops the e2e stack. Containers and the e2e database are kept for the next run (up.sh --fresh resets them).
#   e2e/stack/down.sh          stop
#   e2e/stack/down.sh --purge  also remove the containers, the e2e database and the uploaded files
set -uo pipefail
source "$(dirname "$0")/config.sh"

log() { printf '\033[36m[e2e]\033[0m %s\n' "$*"; }

if [ -f "$STACK_STATE/profile-service.pid" ]; then
  log "stopping profile-service"
  pid=$(cat "$STACK_STATE/profile-service.pid")
  pkill -P "$pid" 2>/dev/null; kill "$pid" 2>/dev/null
  for port_pid in $(lsof -tiTCP:"$PROFILE_SERVICE_PORT" -sTCP:LISTEN 2>/dev/null); do kill "$port_pid" 2>/dev/null; done
  rm -f "$STACK_STATE/profile-service.pid"
fi

for name in "$KEYCLOAK_CONTAINER" "$MAILPIT_CONTAINER" "$E2E_REDIS_CONTAINER"; do
  docker stop "$name" >/dev/null 2>&1 && log "stopped $name"
done

if [ "${1:-}" = "--purge" ]; then
  for name in "$KEYCLOAK_CONTAINER" "$MAILPIT_CONTAINER" "$E2E_REDIS_CONTAINER"; do docker rm "$name" >/dev/null 2>&1; done
  docker network rm "$DOCKER_NETWORK" >/dev/null 2>&1
  DB_USER=$(grep -E '^DATABASE_USERNAME=' "$BACKEND_DIR/profile-service/.env" | cut -d= -f2-)
  docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d postgres -qc "drop database if exists $E2E_DATABASE" && log "dropped $E2E_DATABASE"
  rm -rf "$STACK_STATE"
  log "purged"
fi
