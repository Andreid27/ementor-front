#!/bin/bash
# Settings shared by the e2e stack scripts. Everything here is local and test-only.

E2E_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONT_DIR="$(cd "$E2E_DIR/.." && pwd)"
STACK_STATE="$E2E_DIR/.stack"

# Sibling checkouts the stack is built from
BACKEND_DIR="${BACKEND_DIR:-$FRONT_DIR/../backend}"
DEVOPS_DIR="${DEVOPS_DIR:-$FRONT_DIR/../ementor-devops}"
REALM_EXPORT="${REALM_EXPORT:-$DEVOPS_DIR/Deployments/Production/e-mentor-prod-realm.json}"
# profile-service builds with Java 17: a system JDK, else one installed per user (e.g. by IntelliJ)
if [ -z "${JAVA_HOME:-}" ]; then
  JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || ls -d "$HOME"/Library/Java/JavaVirtualMachines/*17*/Contents/Home 2>/dev/null | head -1)
fi

DOCKER_NETWORK=ementor-e2e
KEYCLOAK_IMAGE=quay.io/keycloak/keycloak:26.4.2
KEYCLOAK_CONTAINER=ementor-e2e-keycloak
KEYCLOAK_PORT=8180
KEYCLOAK_URL="http://localhost:$KEYCLOAK_PORT"
KEYCLOAK_REALM=e-mentor
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
# The confidential client profile-service uses; this secret exists only in the local realm
KEYCLOAK_SERVER_CLIENT=e-mentor-server
KEYCLOAK_SERVER_SECRET=e2e-server-secret

MAILPIT_IMAGE=axllent/mailpit:latest
MAILPIT_CONTAINER=ementor-e2e-mailpit
MAILPIT_URL=http://localhost:8025

# E2E_ prefix: profile-service's .env defines REDIS_* too, and must not override these
E2E_REDIS_IMAGE=redis:7.2-alpine
E2E_REDIS_CONTAINER=ementor-e2e-redis
E2E_REDIS_PORT=6380

# The local prod copy is cloned into its own database, so test users never land in it
POSTGRES_CONTAINER=postgres_dev
SOURCE_DATABASE=profile_service
E2E_DATABASE=profile_service_e2e

PROFILE_SERVICE_PORT=49202
FRONTEND_PORT=3000
