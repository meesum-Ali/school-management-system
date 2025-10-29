#!/usr/bin/env bash
set -euo pipefail

# Fetch an OAuth2 access token from Zitadel using the client_credentials flow.
# Use this when Personal Access Tokens (PAT) are not available.
#
# Required env vars:
#   ZITADEL_ISSUER            Base URL of Zitadel (e.g., http://localhost)
#   ZITADEL_CLIENT_ID         Client ID of an OIDC application with client secret auth enabled
#   ZITADEL_CLIENT_SECRET     Client secret
#   ZITADEL_SCOPES            Space-separated scopes your call needs (e.g., "openid profile email urn:zitadel:iam:org:project:role:write")
#
# Output:
#   Prints the access_token to stdout on success.
#
# Example:
#   export ZITADEL_ISSUER=http://localhost
#   export ZITADEL_CLIENT_ID=...; export ZITADEL_CLIENT_SECRET=...
#   export ZITADEL_SCOPES="openid profile email urn:zitadel:iam:org:project:role:write"
#   TOKEN=$(./utils/zitadel/fetch-token-client-credentials.sh)
#   ZITADEL_TOKEN="$TOKEN" ./utils/zitadel/create-roles.sh

RED="\033[0;31m"; NC="\033[0m"

require_env() {
  local name="$1"; local val="${!name:-}"
  if [[ -z "${val}" ]]; then
    echo -e "${RED}Missing required environment variable: ${name}${NC}" >&2
    exit 1
  fi
}

require_env ZITADEL_ISSUER
require_env ZITADEL_CLIENT_ID
require_env ZITADEL_CLIENT_SECRET
require_env ZITADEL_SCOPES

TOKEN_ENDPOINT="${ZITADEL_ISSUER%/}/oauth/v2/token"

response=$(curl -sS -X POST "$TOKEN_ENDPOINT" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=client_credentials&client_id=${ZITADEL_CLIENT_ID}&client_secret=${ZITADEL_CLIENT_SECRET}&scope=$(printf %s "$ZITADEL_SCOPES" | sed 's/ /%20/g')")

access_token=$(printf '%s' "$response" | sed -n 's/.*"access_token"\s*:\s*"\([^"]\+\)".*/\1/p')

if [[ -z "${access_token}" ]]; then
  echo -e "${RED}Failed to fetch token. Full response:${NC}" >&2
  echo "$response" >&2
  exit 1
fi

printf '%s' "$access_token"
