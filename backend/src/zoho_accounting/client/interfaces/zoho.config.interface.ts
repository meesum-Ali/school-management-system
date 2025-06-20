export interface ZohoConfig {
  region: string; // e.g., 'com', 'eu', 'in'
  clientId: string;
  clientSecret: string;
  redirectUri: string; // For OAuth flow
  organizationId: string;
  refreshToken?: string; // Store this after initial auth
  accessToken?: string; // Store this temporarily
}

export interface ZohoOAuthConfig {
  access_token: string;
  refresh_token?: string; // Not always returned on refresh
  api_domain: string;
  token_type: string;
  expires_in: number; // seconds
}
