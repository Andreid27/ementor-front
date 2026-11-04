#!/bin/bash
# Starts the local stack the registration e2e tests run against:
#   Keycloak (copy of the e-mentor realm) + Mailpit (catches verification emails) + Redis
#   + profile-service on its own copy of the local database.
# The frontend is started by Playwright (see e2e/playwright.config.ts).
#
#   e2e/stack/up.sh            start, reusing what exists
#   e2e/stack/up.sh --fresh    recreate Keycloak, Redis and the e2e database from scratch
set -euo pipefail
source "$(dirname "$0")/config.sh"

FRESH=false
[ "${1:-}" = "--fresh" ] && FRESH=true

mkdir -p "$STACK_STATE/import" "$STACK_STATE/storage"
log() { printf '\033[36m[e2e]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[e2e] %s\033[0m\n' "$*" >&2; exit 1; }

docker info >/dev/null 2>&1 || die "Docker is not running"
docker ps --format '{{.Names}}' | grep -qx "$POSTGRES_CONTAINER" || docker start "$POSTGRES_CONTAINER" >/dev/null
[ -f "$BACKEND_DIR/profile-service/.env" ] || die "missing $BACKEND_DIR/profile-service/.env"
[ -f "$REALM_EXPORT" ] || die "missing realm export $REALM_EXPORT"

docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1 || docker network create "$DOCKER_NETWORK" >/dev/null

start_container() {
  local name=$1; shift
  if $FRESH; then docker rm -f "$name" >/dev/null 2>&1 || true; fi
  if docker ps -a --format '{{.Names}}' | grep -qx "$name"; then
    docker start "$name" >/dev/null
  else
    docker run -d --name "$name" --network "$DOCKER_NETWORK" "$@" >/dev/null
  fi
}

log "Mailpit"
start_container "$MAILPIT_CONTAINER" -p 8025:8025 -p 1025:1025 "$MAILPIT_IMAGE"

log "Redis"
# No password: profile-service does not send one (application.properties has no spring.data.redis.password)
start_container "$E2E_REDIS_CONTAINER" -p "$E2E_REDIS_PORT:6379" "$E2E_REDIS_IMAGE"

log "Keycloak realm from $(basename "$REALM_EXPORT")"
node "$E2E_DIR/stack/build-realm.mjs" "$REALM_EXPORT" "$STACK_STATE/import/e-mentor-realm.json" \
  "$KEYCLOAK_SERVER_SECRET" "$MAILPIT_CONTAINER" >/dev/null
start_container "$KEYCLOAK_CONTAINER" -p "$KEYCLOAK_PORT:8080" \
  -e KC_BOOTSTRAP_ADMIN_USERNAME="$KEYCLOAK_ADMIN_USER" -e KC_BOOTSTRAP_ADMIN_PASSWORD="$KEYCLOAK_ADMIN_PASSWORD" \
  -v "$STACK_STATE/import:/opt/keycloak/data/import:ro" \
  "$KEYCLOAK_IMAGE" start-dev --import-realm
for i in $(seq 1 90); do
  curl -sf "$KEYCLOAK_URL/realms/$KEYCLOAK_REALM" >/dev/null && break
  [ "$i" = 90 ] && die "Keycloak did not start (docker logs $KEYCLOAK_CONTAINER)"
  sleep 2
done
PUBLIC_KEY=$(curl -sf "$KEYCLOAK_URL/realms/$KEYCLOAK_REALM" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).public_key))')
log "Keycloak ready on $KEYCLOAK_URL"

# Only the database user is read here; the rest of profile-service's .env is loaded in its own subshell below,
# so it cannot override this script's settings
DB_USER=$(grep -E '^DATABASE_USERNAME=' "$BACKEND_DIR/profile-service/.env" | cut -d= -f2-)
psql_e2e() { docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d postgres -Atc "$1"; }
if $FRESH; then psql_e2e "drop database if exists $E2E_DATABASE" >/dev/null; fi
if [ -z "$(psql_e2e "select 1 from pg_database where datname = '$E2E_DATABASE'")" ]; then
  log "Cloning $SOURCE_DATABASE into $E2E_DATABASE"
  # A template copy is fast but needs the source database idle; with anything connected to it, copy with pg_dump
  if ! docker exec "$POSTGRES_CONTAINER" createdb -U "$DB_USER" -T "$SOURCE_DATABASE" "$E2E_DATABASE" 2>/dev/null; then
    log "$SOURCE_DATABASE is in use; copying it with pg_dump instead"
    docker exec "$POSTGRES_CONTAINER" createdb -U "$DB_USER" "$E2E_DATABASE"
    # pipefail and ON_ERROR_STOP: a failed dump or restore fails the copy instead of leaving a partial database
    if ! docker exec "$POSTGRES_CONTAINER" bash -c "set -o pipefail; pg_dump -U '$DB_USER' '$SOURCE_DATABASE' | psql -q -v ON_ERROR_STOP=1 -U '$DB_USER' -d '$E2E_DATABASE'" >/dev/null; then
      psql_e2e "drop database if exists $E2E_DATABASE" >/dev/null
      die "could not copy $SOURCE_DATABASE into $E2E_DATABASE"
    fi
  fi
fi

if lsof -tiTCP:"$PROFILE_SERVICE_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  [ -f "$STACK_STATE/profile-service.pid" ] || die "port $PROFILE_SERVICE_PORT is taken by a profile-service that is not the e2e one; stop it first"
  log "profile-service already running"
else
  log "profile-service (logs: $STACK_STATE/profile-service.log)"
  (
    set -a; source "$BACKEND_DIR/profile-service/.env"; set +a
    unset REDIS_PASSWORD
    export DATABASE_NAME="$E2E_DATABASE"
    export KEYCLOAK_SERVER_URL="$KEYCLOAK_URL" KEYCLOAK_REALM="$KEYCLOAK_REALM"
    export KEYCLOAK_CLIENT_ID="$KEYCLOAK_SERVER_CLIENT" KEYCLOAK_CLIENT_SECRET="$KEYCLOAK_SERVER_SECRET"
    export KEYCLOAK_PUBLIC_KEY="$PUBLIC_KEY" KEYCLOAK_CERTIFICATE="$PUBLIC_KEY"
    export REDIS_HOST=localhost REDIS_PORT="$E2E_REDIS_PORT"
    export STORAGE_PATH="$STACK_STATE/storage"
    export SERVICES_HOST=http://127.0.0.1:9 CURRENT_HOST=http://localhost
    export APM_ENABLED=false APM_SERVER_URL=http://127.0.0.1:1 ENV=e2e
    export JAVA_HOME
    cd "$BACKEND_DIR/profile-service"
    nohup ./mvnw spring-boot:run -Dspotless.check.skip=true > "$STACK_STATE/profile-service.log" 2>&1 &
    echo $! > "$STACK_STATE/profile-service.pid"
  )
  for i in $(seq 1 120); do
    grep -q "Started ProfileServiceApplication" "$STACK_STATE/profile-service.log" 2>/dev/null && break
    grep -q -E "APPLICATION FAILED|BUILD FAILURE" "$STACK_STATE/profile-service.log" 2>/dev/null && die "profile-service failed, see $STACK_STATE/profile-service.log"
    [ "$i" = 120 ] && die "profile-service did not start, see $STACK_STATE/profile-service.log"
    sleep 2
  done
fi

log "Stack is up: Keycloak $KEYCLOAK_URL (admin/admin), Mailpit $MAILPIT_URL, profile-service :$PROFILE_SERVICE_PORT"
