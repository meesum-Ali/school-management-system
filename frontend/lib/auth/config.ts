// lib/auth/config.ts
// Zitadel OAuth configuration

export const ZITADEL_CONFIG = {
  issuer: process.env.NEXT_PUBLIC_ZITADEL_ISSUER || 'http://localhost:8888',
  clientId: process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID || '',
  redirectUri:
    process.env.NEXT_PUBLIC_ZITADEL_REDIRECT_URI ||
    'http://localhost:3001/auth/callback',
  // Include roles scope so access/id tokens contain roles claim
  scope:
    'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:roles',
} as const

export const isZitadelConfigured = () => {
  return Boolean(ZITADEL_CONFIG.clientId && ZITADEL_CONFIG.clientId.trim() !== '')
}
