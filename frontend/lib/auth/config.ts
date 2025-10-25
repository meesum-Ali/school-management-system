// lib/auth/config.ts
// Zitadel OAuth configuration

export const ZITADEL_CONFIG = {
  // Browser-facing issuer (what the user agent should be redirected to)
  issuer: process.env.NEXT_PUBLIC_ZITADEL_ISSUER || 'http://localhost',
  clientId: process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID || '',
  redirectUri:
    process.env.NEXT_PUBLIC_ZITADEL_REDIRECT_URI ||
    'http://localhost/auth/callback',
  // Include roles scope so access/id tokens contain roles claim
  scope:
    'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:roles',
} as const

// Server-to-server issuer used by server/edge to call Zitadel internally when running in Docker
// Defaults to direct Zitadel service URL to avoid localhost resolution inside containers
export const ZITADEL_SERVER_ISSUER =
  process.env.ZITADEL_INTERNAL_ISSUER || 'http://zitadel:8080'

// Base URL the server will POST token requests to. In Docker, use the nginx
// service so we can set Host: localhost and keep Zitadel's external domain
// contract intact. Outside Docker, you can omit this and we'll fall back to the
// public issuer.
export const ZITADEL_TOKEN_ENDPOINT_BASE =
  process.env.ZITADEL_TOKEN_BASE || 'http://nginx'

// The external host/domain Zitadel is configured with (ZITADEL_EXTERNALDOMAIN)
// Used as the Host header when calling through nginx.
export const ZITADEL_EXTERNAL_HOST =
  process.env.ZITADEL_EXTERNAL_HOST || 'localhost'

export const isZitadelConfigured = () => {
  return Boolean(
    ZITADEL_CONFIG.clientId && ZITADEL_CONFIG.clientId.trim() !== '',
  )
}
