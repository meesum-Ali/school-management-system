#!/usr/bin/env bash
set -euo pipefail

# This script creates project roles in Zitadel using its Management API with a Personal Access Token (PAT).
# It is idempotent: if a role exists, the API should return a conflict and the script will continue.
#
# Prerequisites:
# - Zitadel running and reachable (default: http://localhost)
# - A Zitadel Project already created; you must supply its ID
# - A Personal Access Token (PAT) with permissions to manage the project (Project Owner/Admin)
#
# Required env vars:
#   ZITADEL_ISSUER       Base URL of Zitadel (e.g., http://localhost)
#   ZITADEL_PROJECT_ID   The project ID where roles should be created
#   ZITADEL_PAT or ZITADEL_TOKEN  A bearer token with permissions (PAT or OAuth access token)
# Optional env vars:
#   ZITADEL_API_PREFIX   API base path (default: /management/v1)
#
# Usage (zsh/bash):
#   export ZITADEL_ISSUER=http://localhost
#   export ZITADEL_PROJECT_ID=<your-project-id>
#   export ZITADEL_PAT=<your-personal-access-token>
#   utils/zitadel/create-roles.sh
#
# Notes:
# - If your Zitadel is exposed behind nginx as in this repo, ISSUER http://localhost works.
# - If you receive 404 for the endpoint, set ZITADEL_API_PREFIX=/v2/management or consult your Zitadel version docs.

RED="\033[0;31m"; GREEN="\033[0;32m"; YELLOW="\033[1;33m"; NC="\033[0m"

require_env() {
  local name="$1"; local val="${!name:-}"
  if [[ -z "${val}" ]]; then
    echo -e "${RED}Missing required environment variable: ${name}${NC}" >&2
    exit 1
  fi
}

ZITADEL_API_PREFIX="${ZITADEL_API_PREFIX:-/management/v1}"

require_env ZITADEL_ISSUER
require_env ZITADEL_PROJECT_ID

# Accept either PAT or a generic OAuth token
AUTH_TOKEN="${ZITADEL_PAT:-${ZITADEL_TOKEN:-}}"
if [[ -z "${AUTH_TOKEN}" ]]; then
  echo -e "${RED}Provide ZITADEL_PAT or ZITADEL_TOKEN in the environment.${NC}" >&2
  exit 1
fi

BASE_URL="${ZITADEL_ISSUER%/}${ZITADEL_API_PREFIX}"

echo -e "Using Zitadel at: ${YELLOW}${ZITADEL_ISSUER}${NC}"
echo -e "API prefix:        ${YELLOW}${ZITADEL_API_PREFIX}${NC}"
echo -e "Project ID:        ${YELLOW}${ZITADEL_PROJECT_ID}${NC}"

# Roles to ensure exist: SUPER_ADMIN, SCHOOL_ADMIN (existing), plus TEACHER, STUDENT, GUARDIAN
declare -a ROLES
ROLES+=("SUPER_ADMIN|Super Admin|administrators|Global super admin")
ROLES+=("SCHOOL_ADMIN|School Admin|administrators|Per-school administrator")
ROLES+=("TEACHER|Teacher|staff|Teaching staff member")
ROLES+=("STUDENT|Student|students|Student user")
ROLES+=("GUARDIAN|Guardian|guardians|Parent/guardian user")

create_role() {
  local key="$1"; local display="$2"; local group="$3"; local desc="$4"

  # Some Zitadel versions use field name 'key', others 'roleKey'. We'll try 'key' first, then fallback.
  # We avoid external deps like jq by building minimal JSON strings (safe for our simple values).
  local body_key
  body_key=$(printf '{"key":"%s","displayName":"%s","group":"%s","description":"%s"}' "$key" "$display" "$group" "$desc")
  local body_roleKey
  body_roleKey=$(printf '{"roleKey":"%s","displayName":"%s","group":"%s","description":"%s"}' "$key" "$display" "$group" "$desc")

  local url="${BASE_URL}/projects/${ZITADEL_PROJECT_ID}/roles"

  echo -e "Ensuring role ${YELLOW}${key}${NC} exists..."

  # Try with 'key'
  http_code=$(curl -sS -o /tmp/zitadel_role_resp.json -w "%{http_code}" \
    -X POST "$url" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$body_key" || true)

  if [[ "$http_code" == "201" || "$http_code" == "200" ]]; then
    echo -e "  ${GREEN}Created${NC} ${key} (using 'key')."
    return 0
  fi

  if [[ "$http_code" == "409" ]]; then
    echo -e "  ${GREEN}Already exists${NC} (${key})."
    return 0
  fi

  # Fallback: try 'roleKey'
  http_code2=$(curl -sS -o /tmp/zitadel_role_resp.json -w "%{http_code}" \
    -X POST "$url" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$body_roleKey" || true)

  if [[ "$http_code2" == "201" || "$http_code2" == "200" ]]; then
    echo -e "  ${GREEN}Created${NC} ${key} (using 'roleKey')."
    return 0
  fi

  if [[ "$http_code2" == "409" ]]; then
    echo -e "  ${GREEN}Already exists${NC} (${key})."
    return 0
  fi

  echo -e "  ${RED}Failed to create role ${key}${NC}. HTTP: ${http_code}/${http_code2}. Response:" >&2
  cat /tmp/zitadel_role_resp.json >&2 || true
  return 1
}

# Check API is reachable
echo -e "Probing Zitadel management API..."
probe_code=$(curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${AUTH_TOKEN}" "${BASE_URL}/projects/${ZITADEL_PROJECT_ID}/roles" || true)
if [[ "$probe_code" != "200" && "$probe_code" != "401" && "$probe_code" != "404" ]]; then
  echo -e "${RED}Could not reach ${BASE_URL}. HTTP ${probe_code}. Check ZITADEL_ISSUER and ZITADEL_API_PREFIX.${NC}" >&2
  exit 1
fi

failures=0
for spec in "${ROLES[@]}"; do
  IFS='|' read -r key display group desc <<<"$spec"
  if ! create_role "$key" "$display" "$group" "$desc"; then
    failures=$((failures+1))
  fi
done

if [[ "$failures" -gt 0 ]]; then
  echo -e "${RED}${failures} role(s) failed to create. See logs above.${NC}" >&2
  exit 1
fi

echo -e "${GREEN}All roles ensured successfully.${NC}"
