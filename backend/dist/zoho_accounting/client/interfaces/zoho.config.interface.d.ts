export interface ZohoConfig {
    region: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    organizationId: string;
    refreshToken?: string;
    accessToken?: string;
}
export interface ZohoOAuthConfig {
    access_token: string;
    refresh_token?: string;
    api_domain: string;
    token_type: string;
    expires_in: number;
}
